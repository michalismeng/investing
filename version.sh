VERSION=$(git describe --tags --first-parent --dirty --match "v[0-9]*")

echo "Writing version ${VERSION}..."

cat <<EOT > src/lib/version.ts
// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT!
/* tslint:disable */
export const VERSION = "${VERSION}";
/* tslint:enable */
EOT