mkdir -p /opt/harbor-bundle
tar xzf harbor-offline-bundle.tar.gz -C /opt/
cd /opt/harbor-bundle

cat > /usr/local/bin/docker <<'EOF'
#!/bin/bash

if [ "$1" == "--version" ] || [ "$1" == "-v" ]; then
  echo "Docker version 24.0.7, build afdd53b"
  exit 0
fi

args=("$@")
for i in "${!args[@]}"; do
  if [ "${args[$i]}" == "-v" ] || [ "${args[$i]}" == "--volume" ]; then
    volarg="${args[$((i+1))]}"
    hostpath="${volarg%%:*}"
    if [[ "$hostpath" == /* ]]; then
      mkdir -p "$hostpath" 2>/dev/null
    fi
  fi
done

exec podman "$@"
EOF

chmod +x /usr/local/bin/docker
docker --version

python3 -m ensurepip --user
python3 -m pip install --no-index --find-links=/opt/harbor-bundle/pip-pkgs podman-compose --user

ln -sf ~/.local/bin/podman-compose /usr/local/bin/podman-compose
ln -sf ~/.local/bin/podman-compose /usr/local/bin/docker-compose

podman-compose --version

systemctl enable --now podman.socket
ln -sf /run/podman/podman.sock /var/run/docker.sock

mkdir -p /data

HARBOR_TGZ=$(find /opt/harbor-bundle -iname "harbor-offline-installer-*.tgz" | head -1)
echo "找到: $HARBOR_TGZ"

tar xzf "$HARBOR_TGZ" -C /data/

mkdir -p /data/harbor/certs
cd /data/harbor/certs

openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -sha512 -days 3650 \
  -subj "/C=TW/ST=Taipei/L=Taipei/O=andy/OU=IT/CN=harbor.ocp.andy.com" \
  -key ca.key -out ca.crt

openssl genrsa -out harbor.ocp.andy.com.key 4096
openssl req -sha512 -new \
  -subj "/C=TW/ST=Taipei/L=Taipei/O=andy/OU=IT/CN=harbor.ocp.andy.com" \
  -key harbor.ocp.andy.com.key -out harbor.ocp.andy.com.csr

cat > v3.ext <<'EOF'
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1=harbor.ocp.andy.com
EOF

openssl x509 -req -sha512 -days 3650 \
  -extfile v3.ext -CA ca.crt -CAkey ca.key -CAcreateserial \
  -in harbor.ocp.andy.com.csr -out harbor.ocp.andy.com.crt

cp ca.crt /etc/pki/ca-trust/source/anchors/harbor-ca.crt
update-ca-trust extract

cd ..
cp harbor.yml.tmpl harbor.yml
vim harbor.yml
====================
hostname: harbor.ocp.andy.com

http:
  port: 80

https:
  port: 443
  certificate: /data/harbor/certs/harbor.ocp.andy.com.crt
  private_key: /data/harbor/certs/harbor.ocp.andy.com.key

harbor_admin_password: Ginnet$%123

trivy:
  offline_scan: true
====================
mv harbor.v2.15.2.tar.gz harbor.v2.tar.gz
podman load -i harbor.v2.tar.gz
./prepare

python3 << 'EOF'
with open('docker-compose.yml') as f:
    lines = f.readlines()

out = []
skip = False
skip_indent = 0

for line in lines:
    stripped = line.rstrip('\n')
    indent = len(stripped) - len(stripped.lstrip(' '))
    content = stripped.strip()

    if skip:
        if content == '' or indent > skip_indent:
            continue
        else:
            skip = False

    if content == 'logging:':
        skip = True
        skip_indent = indent
        continue

    out.append(line)

with open('docker-compose.yml', 'w') as f:
    f.writelines(out)
EOF

grep -n "^\s*logging:" docker-compose.yml

podman-compose up -d

