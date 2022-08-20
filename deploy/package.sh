VERSION=$1

echo "Packaging version ${VERSION}"

cd public && zip -r ../Pock_v${VERSION}.zip * && cd ..