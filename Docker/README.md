## Instructions
1. Build the docker image: `docker build -t twitchdev .`

2. Add `127.0.0.1 localhost.rig.twitch.tv` to your local `/etc/hosts`. This is
needed because of the callback URL after authorizing twitch dev.

3. Internally, nginx is forwarding https traffic to port 3000 *inside* the container. The outside port (host port) of 3000 is needed because of the callback URL. Run a container, mapping port 3000 to 443:   
`docker run -ti -p 3000:443 twitchdev`  

4. Visit `localhost:3000` or `localhost.rig.twitch.tv:3000`. You will get a warning
saying the website is insecure. This is because the SSL certificates live inside
the container instead of the host certificate store. You may safely ignore the warning and proceed.
