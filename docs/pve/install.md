### **<font color="red">初始化設定</font>** 
**Create Cluster**
```
root@pve1:~# pvecm create cluster1

root@pve2:~# pvecm add 172.22.46.241
Please enter superuser (root) password for '172.22.46.241': ***********
Are you sure you want to continue connecting (yes/no)? yes
successfully added node 'pve2' to cluster

root@pve1:~# pvecm nodes
Membership information
----------------------
    Nodeid      Votes Name
         1          1 pve1 (local)
         2          1 pve2
         3          1 pve3
```

**NTP 設定**
```
vi /etc/chrony/chrony.conf
server 172.22.46.250 iburst
server time.google.com iburst
server ntp.nict.jp iburst

systemctl enable chrony --now
systemctl restart chronyd
chronyc -a makestep
date
```

**線上更新**
```
rm /etc/apt/sources.list.d/pve-enterprise.sources
rm /etc/apt/sources.list.d/ceph.sources
sed -i 's|http://ftp.debian.org|https://mirrors.ustc.edu.cn|g' /etc/apt/sources.list
sed -i 's|http://security.debian.org|https://mirrors.ustc.edu.cn/debian-se...|g' /etc/apt/sources.list
apt update && apt full-upgrade -y
```

**移除『未訂閱』提示**
```
sed -i.bak "s/data.status.toLowerCase() !== 'active'/false/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
systemctl restart pveproxy.service
```
