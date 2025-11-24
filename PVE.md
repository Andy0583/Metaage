### 時間校時
```
vi /etc/chrony/chrony.conf
```
> ```
> # 刪除
> pool 2.debian.pool.ntp.org iburst
> # 增加
> server time.stdtime.gov.tw iburst
> server clock.stdtime.gov.tw iburst
> ```
```
systemctl enable chrony --now
systemctl restart chronyd
chronyc -a makestep
date
```
### 線上更新
```
rm /etc/apt/sources.list.d/pve-enterprise.sources
rm /etc/apt/sources.list.d/ceph.sources
sed -i 's|http://ftp.debian.org|https://mirrors.ustc.edu.cn|g' /etc/apt/sources.list
sed -i 's|http://security.debian.org|https://mirrors.ustc.edu.cn/debian-se...|g' /etc/apt/sources.list
apt update && apt full-upgrade -y
```
### 移除未訂閱
``` 
sed -i.bak "s/data.status.toLowerCase() !== 'active'/false/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
systemctl restart pveproxy.service
```
### 設定Hosts，於GUI介面進入每台Node —> System —> Hosts，貼上Ceph網段IP，記得save
``` 
172.12.25.71 pve1.andy.com pve1
172.12.25.72 pve2.andy.com pve2
172.12.25.73 pve3.andy.com pve3
#記得Save
```
