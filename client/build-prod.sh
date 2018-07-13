rm -r dist

yarn "webpack"

cp -r ./public/* dist

cd dist

zip -r $(date +"%G-%m-%M-%H-%M-%S") *
