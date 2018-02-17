if [ ! -f package.json]; then
git clone https://github.com/Bkucera/housing-sim.git && cd housing-sim
else
echo "already cloned the repo"
fi
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash &&
. ~/.bashrc
nvm install --lts &&
nvm alias default node
npm install
npm run start