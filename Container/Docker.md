## Docker Overview
### Container介紹
* 容器（Container）：運行在Image上的應用程式，如 Web Service、Dell SCG、網路銀行APP...等。<br>

|優點|缺點|
|---|---|
|因運行在Image上，無須作業系統，資源利用率高、容量需求小、啟動極快|每個應用程式，需一個容器或數十個容器組成，管理較為不易|
|無須擔心系統故障，只需在相同Image上，重啟另一個容器即可|共用宿主主機及Image，若有漏洞則容易造成安全上隱憂|
|搭配K8S或OCP等管理工具，極易擴展、縮減、HA|網路與傳統網路不同，如Service、Ingress..等，學習曲線較高|

### Container架構示意圖
![](./image/001.png)

### Docker前世今生
* Docker 是一種輕量級虛擬化技術，可建立獨立的容器 (Container)，能夠快速地進行開發、交付、部署、測試應用程式。
* 因Docker與K8S介接，需使用到Dockershim，維護成本過高，2022年5月K8Sv1.24宣布移除 Dockershim，使得Docker無法使用於K8S上。
* 之後Mirantis公司接手維護Dockershim，將之前Docker Enterprise Edition改名Mirantis Kubernetes Engine (MKE)。

### Docker三大組成元件
* 映像檔 (Image)：用來建立 Container 的應用程式環境，是一個類似 VM 的 ISO 檔。
* 容器 (Container)：Container 是由 Image 所建立，運行於Runtime上。
* 倉庫 (Registry)：用來管理 Image的空間，包含版本及標籤的 Images 集合。
![](./image/004.png)

## Docker 安裝
* 至[Docker官網](https://download.docker.com/linux/static/stable/x86_64/)下載最新Docker。

### 安裝程序
```
tar -xvf docker-29.1.3.tgz
cp docker/* /usr/bin/

vi /etc/systemd/system/docker.service
=============================
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service
Wants=network-online.target

[Service]
Type=notify
ExecStart=/usr/bin/dockerd
ExecReload=/bin/kill -s HUP $MAINPID
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TimeoutStartSec=0
Delegate=yes
KillMode=process
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s

[Install]
WantedBy=multi-user.target
=============================

chmod +x /etc/systemd/system/docker.service
systemctl daemon-reload
systemctl start docker
systemctl enable docker.service

# 檢查安裝是否完成
root@ubuntu:~# docker -v
Docker version 29.1.3, build f52814d
```
