# GRAID 技術更新
## SupremeRAID AE 
- GRAID 新版的Pre-installer若安裝在離線RedHat上，已無法使用舊語法，需改用下列語法進行安裝：
```shell
LOCAL_ISO_PATH=/mnt/dvd/ DKMS_PKG_PATH=/root/dkms-3.4.3-2.el9.noarch.rpm bash graid-sr-pre-installer-2.0.0-nv580-270-x86_64.run -pl ae --offline-install
```
