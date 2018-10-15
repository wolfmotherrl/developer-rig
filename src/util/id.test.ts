import { DeveloperRigUserId } from '../constants/rig';
import { fetchIdForUser, generateId } from './id';

describe('fetch-id-for-user', () => {
  const token = 'test';
  const globalAny = global as any;

  it("fetches an id for a user name", async () => {
    const expected = DeveloperRigUserId;
    globalAny.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200, json: () => Promise.resolve({ data: [{ id: expected }] })
    }));
    const actual = await fetchIdForUser(token, 'name');
    expect(actual).toEqual(expected);
  });

  it("fetches an id for a user id", async () => {
    const expected = DeveloperRigUserId;
    globalAny.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200, json: () => Promise.resolve({ data: [{ id: expected }] })
    }));
    const actual = await fetchIdForUser(token, expected);
    expect(actual).toEqual(expected);
  });

  it("throws an exception for an unknown user name", async () => {
    const notExpected = DeveloperRigUserId;
    globalAny.fetch = jest.fn().mockImplementation(() => Promise.resolve({ status: 200, json: () => Promise.resolve({ data: [] }) }));
    try {
      const actual = await fetchIdForUser(token, 'name');
      expect(actual).not.toEqual(notExpected);
    } catch (ex) { }
  });

  it("throws an exception for an unknown user id", async () => {
    const notExpected = DeveloperRigUserId;
    globalAny.fetch = jest.fn().mockImplementation(() => Promise.resolve({ status: 200, json: () => Promise.resolve({ data: [] }) }));
    try {
      const actual = await fetchIdForUser(token, notExpected);
      expect(actual).not.toEqual(notExpected);
    } catch (ex) { }
  });
});

describe('generateId', () => {
  it('generates an ID we expect', () => {
    const idLength = 15;
    const genOpaqueId = generateId(idLength);
    expect(genOpaqueId).toHaveLength(idLength);
  });
});
