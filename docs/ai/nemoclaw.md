**Docker安裝**
```
curl -fsSL https://get.docker.com | sh
systemctl start docker && systemctl enable docker
apt install docker-compose -y
docker -v
docker-compose version
```

**Node.js安裝**
```
apt install -y nodejs
```

**nemoclaw主程式安裝**
```
curl -fsSL https://www.nvidia.com/nemoclaw.sh | bash
source ~/.bashrc

nemoclaw andy-sandbox connect

openclaw configure --section web
```

**使用root登入container，查出目錄**
```
docker exec -it -u root openshell-cluster-nemoclaw /bin/bash
```

**變更Owner成為sandbox帳號**
```
chown -R 998:998 .openclaw
```

**啟動**
```
openclaw tui
```

**若gateway有問題**
```
kill -9 84
openclaw gateway

ssh -N -f -L 18791:localhost:18791 root@172.12.25.13
```
