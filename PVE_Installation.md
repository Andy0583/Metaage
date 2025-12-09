## 初始設定
### 時間校時
```
nano /etc/chrony/chrony.conf
```
> ```
> # 刪除
> pool 2.debian.pool.ntp.org iburst
> # 增加
> server 172.12.25.51 iburst
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

## iSCSI設定
### iSCSI Discovery
```
iscsiadm -m discovery -t st -p 192.168.130.228:3260
iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt25482nsdir.a1 -l
iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt25482nsdir.a3 -l
iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt25482nsdir.a1 -p 192.168.130.228 --op update -n node.startup -v automatic
iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt25482nsdir.a3 -p 192.168.131.228 --op update -n node.startup -v automatic
```
### Storage配置後
```
iscsiadm -m session --rescan
lsblk
```
### Multipath安裝
```
# Multipath線上安裝
apt install multipath-tools -y

# Multipath離線安裝
tar -xvf multipath.tar
cd multipath
dpkg -i *.deb
systemctl enable multipathd && systemctl start multipathd

vi /etc/multipath.conf
=======================
defaults {
    user_friendly_names yes
    find_multipaths yes
    path_grouping_policy    multibus
    path_selector           "round-robin 0"
    failback                immediate
    rr_min_io               1
    max_fds                 max
    rr_weight               priorities
}

blacklist {
    devnode "^sda" 
}
=======================
reboot
multipath -ll
lsblk

```

### 建置PV & VG
```
# 單台Node設定即可
root@pve1:~# fdisk -l
.......................
Disk /dev/mapper/mpatha: 30 GiB, 32212254720 bytes, 62914560 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 8192 bytes / 4194304 bytes

root@pve1:~# pvcreate /dev/mapper/mpatha
  Physical volume "/dev/mapper/mpatha" successfully created.
  
root@pve1:~# vgcreate andy_vg /dev/mapper/mpatha
  Volume group "andy_vg" successfully created

# 若需建立LVM-thin，需建立LV
root@pve1:~# lvcreate -l 100%FREE --thinpool thinpool andy_vg
  Thin pool volume with chunk size 64.00 KiB can address at most <15.88 TiB of data.
  Logical volume "andy_thinpool" created.
```

## 離線安裝Ceph
### Ceph安裝
```
mkdir ceph_offline
cd ceph_offline
#上傳ceph.tar至ceph_offline目錄中
tar -xvf ceph.tar
dpkg -i *.deb
```
### Ceph初始化
```
# 需先建立Ceph network
pveceph init --network 192.168.10.0/24
pveceph createmon
```
