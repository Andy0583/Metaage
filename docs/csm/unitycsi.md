## Dell Unity CSI Installation
### 1.若需使用iSCSI，每台Node設定iSCSI連接 ###
```
echo "InitiatorName=`/sbin/iscsi-iname`" > /etc/iscsi/initiatorname.iscsi
iscsiadm -m discovery -t st -p 172.22.46.233
iscsiadm --mode node --portal 172.22.46.233:3260,1 iqn.1992-04.com.emc:cx.virt2418y8kp91.a3 --login
systemctl restart open-iscsi
```

### 2.安裝所需Tool ###
```
apt-get update
apt-get install sshpass
apt install nfs-common -y
apt -y install open-iscsi multipath-tools -y
systemctl restart iscsid.service
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

### 3.下載Unity CSI及CSI Snapshot ###
```
git clone -b v2.11.1 https://github.com/dell/csi-unity.git
git clone https://github.com/kubernetes-csi/external-snapshotter/
```

### 4.安裝snapshotter ###
```
cd ~/external-snapshotter
kubectl kustomize client/config/crd | kubectl create -f -
kubectl -n kube-system kustomize deploy/kubernetes/snapshot-controller | kubectl create -f -
```

### 5.安裝CSI，需與Unity相通 ###
```
kubectl create namespace unity-csi
cd ~/csi-unity/dell-csi-helm-installer/
git clone https://github.com/dell/helm-charts.git
openssl s_client -showcerts -connect 172.12.25.31:443 </dev/null 2>/dev/null | openssl x509 -outform PEM > ca_cert_0.pem
kubectl create secret generic unity-certs-0 -n unity-csi --from-file=cert-0=ca_cert_0.pem
```

### 6.建立secret.yaml ###
```
cat >> secret.yaml << EOF
storageArrayList:
  - arrayId: "VIRT2439LWLCT3"
    username: "admin"
    password: "Ginnet$%123" 
    endpoint: "https://172.12.25.31/" 
    skipCertificateValidation: true
    isDefault: true
EOF

kubectl create secret generic unity-creds -n unity-csi --from-file=config=secret.yaml
```

### 7.若修改secret.yaml後更新 ###
```
kubectl create secret generic unity-creds -n unity-csi --from-file=config=secret.yaml -o yaml --dry-run | kubectl replace -f -
```

### 8.下載values.yaml ###
```
wget -O values.yaml https://github.com/dell/helm-charts/raw/csi-unity-2.11.1/charts/csi-unity/values.yaml
```

### 9.若CSI版本不同，需修改values.yaml ###
```
vi values.yaml

version: "v2.11.0"
```

### 10.安裝CSI ###

```
./csi-install.sh --namespace unity-csi --values ./values.yaml --skip-verify-node

Press 'y' to continue or any other key to exit: y
|
|- Installing Driver                                                Success
  |
  |--> Waiting for Deployment unity-controller to be ready          Success
  |
  |--> Waiting for DaemonSet unity-node to be ready                 Success
------------------------------------------------------
> Operation complete
------------------------------------------------------

# 移除CSI
./csi-uninstall.sh --namespace unity-csi
```

### 11.驗證 ###
```
root@k8s1:~/csi-unity/dell-csi-helm-installer# kubectl get pod -n unity-csi
NAME                                READY   STATUS    RESTARTS   AGE
unity-controller-778d97dffc-2zm94   5/5     Running   0          89s
unity-controller-778d97dffc-bx9hd   5/5     Running   0          89s
unity-node-52wv4                    2/2     Running   0          89s
unity-node-5mk6v                    2/2     Running   0          89s
```
