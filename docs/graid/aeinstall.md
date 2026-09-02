## SupremeRAID AE For RHEL 9.6 SOP(T400)
### RHEL設定
```
** 關閉安全性及防火牆 **
sed -i 's/enforcing/disabled/' /etc/selinux/config
systemctl stop firewalld &&systemctl disable firewalld

**# Mount ISO **
mkdir -p /mnt/dvd
mount -o loop /root/rhel-9.6-x86_64-dvd.iso /mnt/dvd

**# 修改repo **
vi /etc/yum.repos.d/local-dvd.repo
[local-baseos]
name=Red Hat Enterprise Linux BaseOS - Local DVD
baseurl=file:///mnt/dvd/BaseOS
enabled=1
gpgcheck=0

[local-appstream]
name=Red Hat Enterprise Linux AppStream - Local DVD
baseurl=file:///mnt/dvd/AppStream
enabled=1
gpgcheck=0

vi /etc/yum/pluginconf.d/subscription-manager.conf
[main]
enabled=0

dnf clean all
dnf makecache
```
### 安裝graid-sr-pre-installer
```
LOCAL_ISO_PATH=/mnt/dvd/ DKMS_PKG_PATH=/root/dkms-3.4.3-2.el9.noarch.rpm bash graid-sr-pre-installer-2.0.0-nv580-270-x86_64.run -pl ae --offline-install


+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.159.03             Driver Version: 580.159.03     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA T400 4GB                Off |   00000001:15:00.0 Off |                  N/A |
| 36%   41C    P0            N/A  /   31W |       1MiB /   4096MiB |      1%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
Install NVIDIA Driver succeeded.
```

### 加入T400的id
```
vim /etc/graid_pre_installer.conf
EXPECTED_GPU_CARDS="1ff2"
```

### 安裝SupremeRAID AE Only for T400
```
bash ****graid-sr-ae-installer-2.0.0-tu75-193-174.run 
```
