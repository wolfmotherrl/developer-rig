import * as React from 'react';
import * as closeButton from '../img/close_icon.png';
import './component.sass';
import classNames = require('classnames');
import { ExtensionManifest } from '../core/models/manifest';
import { createProject, Example, fetchExamples } from '../util/api';
import { RigProject } from '../core/models/rig';
import { fetchUserExtensionManifest } from '../util/extension';
import { generateManifest } from '../util/generate-manifest';
import { ExtensionViewType } from '../constants/extension-coordinator';
import { LocalStorageKeys } from '../constants/rig';

interface Props {
  userId: string;
  mustSave?: boolean;
  closeHandler: () => void;
  saveHandler: (state: RigProject) => void;
}

interface State {
  rigProject: RigProject;
  localName: string;
  clientId: string;
  version: string;
  codeGenerationOption: string;
  extensionTypes: number;
  scaffoldingOptions: number;
  errorMessage?: string;
  examples: Example[];
  exampleIndex: number;
  [key: string]: number | string | RigProject | Example[];
}

enum CodeGenerationOption {
  None = 'none',
  Scaffolding = 'scaffolding',
  Example = 'example',
}

enum ScaffoldingOptions {
  None = 0,
  StoreConfiguration = 1,
  RetrieveConfiguration = 2,
}

enum ExtensionTypes {
  Panel = 1,
  Component = 2,
  Overlay = 4,
  Mobile = 8,
}

export class CreateProjectDialog extends React.Component<Props, State>{
  private initial: { isMounted: boolean } = { isMounted: false };
  public state: State = {
    rigProject: {
      isLocal: true,
      projectFolderPath: '',
      manifest: {} as ExtensionManifest,
      secret: process.env.EXT_SECRET || '',
      frontendFolderName: '',
      frontendCommand: '',
      backendCommand: '',
    } as RigProject,
    localName: '',
    clientId: process.env.EXT_CLIENT_ID || '',
    version: process.env.EXT_VERSION || '',
    codeGenerationOption: CodeGenerationOption.Example,
    extensionTypes: ExtensionTypes.Panel,
    scaffoldingOptions: ScaffoldingOptions.None,
    examples: [],
    exampleIndex: 0,
  };

  public async componentDidMount() {
    this.initial.isMounted = true;
    const examples = await fetchExamples();
    if (this.initial.isMounted) {
      this.setState({ examples });
    }
  }

  public componentWillUnmount() {
    this.initial.isMounted = false;
  }

  public onChange = (input: React.FormEvent<HTMLInputElement>) => {
    const { name, checked, type, value } = input.currentTarget;
    if (type === 'checkbox') {
      if (typeof this.state[name] === 'boolean') {
        const rigProject = Object.assign(this.state.rigProject, { [name]: checked }) as RigProject;
        this.setState({ rigProject, errorMessage: null });
      } else {
        this.setState((previousState) => {
          const previousValue = previousState[name] as number;
          const numericValue = Number(value);
          if (checked) {
            return { [name]: previousValue | numericValue, errorMessage: null };
          } else {
            return { [name]: previousValue & ~numericValue, errorMessage: null };
          }
        });
      }
    } else if (name !== 'localName' || this.state.rigProject.isLocal) {
      const convert = typeof this.state[name] === 'number' ? (s: string) => Number(s) : (s: string) => s;
      if (Object.getOwnPropertyDescriptor(this.state.rigProject, name)) {
        const rigProject = Object.assign(this.state.rigProject, { [name]: convert(value) }) as RigProject;
        this.setState({ rigProject, errorMessage: null });
      } else {
        this.setState({ [name]: convert(value), errorMessage: null });
      }
    }
  }

  public onChangeExample = (exampleIndex: number) => {
    this.setState({ exampleIndex });
  }

  public onChangeIsLocal = (input: React.FormEvent<HTMLInputElement>) => {
    const target = input.currentTarget;
    const value = Boolean(Number(target.value));
    this.setState((previousState) => {
      const rigProject = Object.assign({}, previousState.rigProject, { isLocal: value });
      return { rigProject };
    });
  }

  private canSave = () => {
    // The project must have a project folder root if the code generation
    // option is not None.
    const { localName, codeGenerationOption, rigProject, extensionTypes } = this.state;
    if (codeGenerationOption !== CodeGenerationOption.None && !rigProject.projectFolderPath.trim()) {
      return false;
    }

    if (rigProject.isLocal) {
      // The project must be named.
      if (!localName.trim()) {
        return false;
      }

      // At least one extension type must be selected.
      if (!extensionTypes) {
        return false;
      }
    } else {
      // An online extension must be selected.
      if (!rigProject.manifest.id) {
        return false;
      }
    }
    return true;
  }

  private getTypes(): ExtensionViewType[] {
    const types: ExtensionViewType[] = [];
    this.state.extensionTypes & ExtensionTypes.Component && types.push(ExtensionViewType.Component);
    this.state.extensionTypes & ExtensionTypes.Mobile && types.push(ExtensionViewType.Mobile);
    this.state.extensionTypes & ExtensionTypes.Overlay && types.push(ExtensionViewType.Overlay);
    this.state.extensionTypes & ExtensionTypes.Panel && types.push(ExtensionViewType.Panel);
    return types;
  }

  private constructBackendCommand(example: Example) {
    if (this.state.codeGenerationOption === CodeGenerationOption.Example && example.backendCommand) {
      let backendCommand = example.backendCommand
        .replace('{clientId}', this.state.rigProject.manifest.id)
        .replace('{secret}', this.state.rigProject.secret)
        .replace('{ownerId}', this.props.userId);
      if (this.state.rigProject.isLocal) {
        backendCommand += ' -l';
      }
      return backendCommand;
    }
    return '';
  }

  private saveHandler = async () => {
    if (this.canSave()) {
      try {
        this.setState({ errorMessage: 'Creating your project...' });
        if (this.state.rigProject.isLocal) {
          this.state.rigProject.secret = this.state.rigProject.secret || 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk';
          const ownerName: string = JSON.parse(localStorage.getItem(LocalStorageKeys.RigLogin)).login;
          this.state.rigProject.manifest = generateManifest('https://localhost.rig.twitch.tv:8080',
            ownerName, this.state.localName.trim(), this.getTypes());
        }
        const { codeGenerationOption, exampleIndex, examples } = this.state;
        const projectFolderPath = this.state.rigProject.projectFolderPath.trim();
        if (codeGenerationOption !== CodeGenerationOption.None || projectFolderPath) {
          await createProject(projectFolderPath, codeGenerationOption, exampleIndex);
        }
        const example = examples[exampleIndex];
        const rigProject = {
          ...this.state.rigProject,
          frontendFolderName: codeGenerationOption === CodeGenerationOption.Example ? example.frontendFolderName : '',
          frontendCommand: codeGenerationOption === CodeGenerationOption.Example ? example.frontendCommand : '',
          backendCommand: this.constructBackendCommand(example),
        };
        this.props.saveHandler(rigProject as RigProject);
      } catch (ex) {
        console.error(ex);
        this.setState({ errorMessage: ex.message });
      }
    }
  }

  private fetchExtensionManifest = async () => {
    const { clientId, version, rigProject: { isLocal, secret } } = this.state;
    try {
      const manifest = await fetchUserExtensionManifest(isLocal, this.props.userId, secret, clientId, version);
      const rigProject = Object.assign({}, this.state.rigProject, { manifest });
      this.setState({ rigProject });
    } catch (ex) {
      const rigProject = Object.assign({}, this.state.rigProject, { manifest: ex.message });
      this.setState({ rigProject });
    }
  }

  private constructClassName(isSuccessful: boolean | string, name: string, modifier?: string) {
    return classNames(name, {
      [`${name}--${modifier}`]: !!modifier,
      [`${name}--error`]: !isSuccessful,
    });
  }

  public render() {
    const pdp = 'project-dialog-property';
    const [pdpi, pdpri] = [`${pdp}__input`, `${pdp}__right-input`];
    const { codeGenerationOption, extensionTypes, rigProject } = this.state;
    const nameInputClassName = this.constructClassName(!rigProject.isLocal || this.state.localName.trim(), pdpi, 'half');
    const localName = rigProject.isLocal ? this.state.localName : rigProject.manifest.name || '';
    const typesClassName = this.constructClassName(extensionTypes !== 0, `${pdp}__name`);
    const clientIdClassName = this.constructClassName(this.state.clientId.trim(), pdpri, 'grid');
    const secretClassName = this.constructClassName(rigProject.secret.trim(), pdpri, 'grid');
    const versionClassName = this.constructClassName(this.state.version.trim(), pdpri, 'grid');
    const manifestClassName = this.constructClassName(rigProject.manifest.id, `${pdp}__textarea`);
    const projectFolderClassName = classNames(pdpi, {
      [`${pdpi}--error`]: !(codeGenerationOption === CodeGenerationOption.None || rigProject.projectFolderPath.trim()),
    });
    const saveClassName = classNames('bottom-bar__save', { 'bottom-bar__save--disabled': !this.canSave() });
    return (
      <div className="project-dialog">
        <div className="project-dialog__background" />
        <div className="project-dialog__dialog">
          <div className="project-dialog__header">
            <div className="project-dialog__title">Create New Extension Project</div>
            {!this.props.mustSave && <div className="project-dialog__escape" onClick={this.props.closeHandler}><img alt="Close" src={closeButton} /></div>}
          </div>
          {this.state.errorMessage && <div>{this.state.errorMessage}</div>}
          <hr className="project-dialog__divider" />
          <div className="project-dialog__body">
            <div className="project-dialog__section project-dialog__section--left">
              <label className="project-dialog-property">
                <div className="project-dialog-property__name">Extension Project Name</div>
                <input className={nameInputClassName} type="text" name="localName" value={localName} onChange={this.onChange} disabled={!rigProject.isLocal} title="Enter a name for your project.  This is set for you for online extensions." />
              </label>
              <div className="project-dialog-property">
                <div className="project-dialog-property__name">Choose Extension</div>
                <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="radio" name="isLocal" value={1} checked={rigProject.isLocal} onChange={this.onChangeIsLocal} />
                  <span className="project-dialog-property__right-text">Create Local Extension</span>
                </label>
                <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="radio" name="isLocal" value={0} checked={!rigProject.isLocal} onChange={this.onChangeIsLocal} />
                  <span className="project-dialog-property__right-text">Use Already Created Online Extension</span>
                </label>
              </div>
              {rigProject.isLocal && <div className="project-dialog-property">
                <div className={typesClassName}>Extension Types</div>
                <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="checkbox" name="extensionTypes" value={ExtensionTypes.Overlay} checked={Boolean(extensionTypes & ExtensionTypes.Overlay)} onChange={this.onChange} />
                  <span className="project-dialog-property__right-text">Video Overlay</span>
                </label>
                <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="checkbox" name="extensionTypes" value={ExtensionTypes.Panel} checked={Boolean(extensionTypes & ExtensionTypes.Panel)} onChange={this.onChange} />
                  <span className="project-dialog-property__right-text">Panel</span>
                </label>
                <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="checkbox" name="extensionTypes" value={ExtensionTypes.Component} checked={Boolean(extensionTypes & ExtensionTypes.Component)} onChange={this.onChange} />
                  <span className="project-dialog-property__right-text">Component</span>
                </label>
                <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="checkbox" name="extensionTypes" value={ExtensionTypes.Mobile} checked={Boolean(extensionTypes & ExtensionTypes.Mobile)} onChange={this.onChange} />
                  <span className="project-dialog-property__right-text">Mobile</span>
                </label>
              </div>}
              {!rigProject.isLocal && <div className="project-dialog-property">
                <label className="project-dialog-property__value project-dialog-property__value--grid">
                  <span className="project-dialog-property__left-text project-dialog-property__left-text--grid">Client ID</span>
                  <input className={clientIdClassName} type="text" name="clientId" value={this.state.clientId} onChange={this.onChange} />
                </label>
                <label className="project-dialog-property__value project-dialog-property__value--grid">
                  <span className="project-dialog-property__left-text project-dialog-property__left-text--grid">Secret</span>
                  <input className={secretClassName} type="text" name="secret" value={rigProject.secret} onChange={this.onChange} />
                </label>
                <label className="project-dialog-property__value project-dialog-property__value--grid">
                  <span className="project-dialog-property__left-text project-dialog-property__left-text--grid">Version</span>
                  <input className={versionClassName} type="text" name="version" value={this.state.version} onChange={this.onChange} />
                </label>
                <button className="project-dialog-property__button" onClick={this.fetchExtensionManifest}>Fetch</button>
                <textarea className={manifestClassName} value={JSON.stringify(rigProject.manifest)} disabled={true} />
              </div>}
              <label className="project-dialog-property" title="This is the folder we will create to contain your project. You must have already created its parent folder.">
                <div className="project-dialog-property__name">Project Folder</div>
                <input className={projectFolderClassName} type="text" name="projectFolderPath" value={rigProject.projectFolderPath} onChange={this.onChange} />
              </label>
              <div className="project-dialog-property">
                <div className="project-dialog-property__name">Add Code to Project</div>
                <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="radio" name="codeGenerationOption" value={CodeGenerationOption.None} checked={codeGenerationOption === CodeGenerationOption.None} onChange={this.onChange} />
                  <span className="project-dialog-property__right-text">None (Only create project folder, if specified)</span>
                </label>
                {false && <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="radio" name="codeGenerationOption" value={CodeGenerationOption.Scaffolding} checked={codeGenerationOption === CodeGenerationOption.Scaffolding} onChange={this.onChange} />
                  <span className="project-dialog-property__right-text">Generate Scaffolding</span>
                </label>}
                <label className="project-dialog-property__value">
                  <input className="project-dialog-property__left-input" type="radio" name="codeGenerationOption" value={CodeGenerationOption.Example} checked={codeGenerationOption === CodeGenerationOption.Example} onChange={this.onChange} />
                  <span className="project-dialog-property__right-text">Use Existing Example</span>
                </label>
              </div>
            </div>
            <div className="project-dialog__vertical-bar" />
            <div className="project-dialog__section project-dialog__section--right">
              {codeGenerationOption === CodeGenerationOption.Scaffolding ? (
                <>
                  <div className="project-dialog__section-header">Tell us more about what your extension will do</div>
                  <div className="project-dialog__section-text">(We’ll automatically provide basic React-based scaffolding, but we want to provide extras where useful!)</div>
                  <label className="project-dialog-property">
                    <input className="project-dialog-property__left-input" type="checkbox" name="scaffoldingOptions" value={ScaffoldingOptions.StoreConfiguration} checked={Boolean(this.state.scaffoldingOptions)} onChange={this.onChange} />
                    <span className="project-dialog-property__right-text">Store Broadcaster Configuration</span>
                  </label>
                  <label className="project-dialog-property">
                    <input className="project-dialog-property__left-input" type="checkbox" name="scaffoldingOptions" value={ScaffoldingOptions.RetrieveConfiguration} checked={Boolean(this.state.scaffoldingOptions & ScaffoldingOptions.RetrieveConfiguration)} onChange={this.onChange} />
                    <span className="project-dialog-property__right-text">Retrieve Configuration on Load</span>
                  </label>
                </>
              ) : codeGenerationOption === CodeGenerationOption.Example ? (
                <>
                  <div className="project-dialog__section-header">Start from an existing extension example from Twitch or the Developer Community</div>
                  <label className="project-dialog-property">
                    <div className="project-dialog-property__name">Twitch Provided Examples</div>
                    <div className="project-dialog-property__box">
                      {this.state.examples.map((example, index) => {
                        const className = 'project-dialog-property__option' +
                          (this.state.exampleIndex === index ? ' project-dialog-property__option--selected' : '');
                        return (
                          <div key={index} className={className} onClick={() => this.onChangeExample(index)}>
                            <div className="project-dialog-property__option-title">{example.title}</div>
                            <div className="project-dialog-property__option-description">{example.description}</div>
                          </div>
                        );
                      })}
                    </div>
                  </label>
                  <label className="project-dialog-property">
                    <div className="project-dialog-property__name">Community Examples</div>
                    <div className="project-dialog-property__right-text">Coming soon!  Reach out to developers@twitch.tv if you’d like to contribute.</div>
                  </label>
                </>
              ) : (
                    <div className="project-dialog__section-header">You’re all set!  Good luck on your extension!</div>
                  )}
            </div>
          </div>
          <hr className="project-dialog__divider" />
          <div className="project-dialog__footer">
            <div className={saveClassName} onClick={this.saveHandler}>Save</div>
            {!this.props.mustSave && (
              <div className="bottom-bar__cancel" onClick={this.props.closeHandler}>Cancel</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
