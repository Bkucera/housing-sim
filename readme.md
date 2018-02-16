install [nodejs version manager](https://github.com/creationix/nvm):
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```
then reload your bashrc:
```
. ~/.bashrc
```
then activate the LTS version of nodejs:
```
nvm install --lts
...
...
nvm use --lts 
```
finally, install my dependencies and run the simulation:
```
npm install
...
...
npm run start
```