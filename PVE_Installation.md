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
root@pve1:~# cat /etc/iscsi/initiatorname.iscsi
InitiatorName=iqn.1994-05.com.redhat:client01

root@pve1:~# iscsiadm -m discovery -t st -p 172.12.25.33:3260
172.12.25.33:3260,1 iqn.1992-04.com.emc:cx.virt2444cbsk5x.a1
172.12.25.34:3260,2 iqn.1992-04.com.emc:cx.virt2444cbsk5x.a2

root@pve1:~# iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt2444cbsk5x.a1 -l
Logging in to [iface: default, target: iqn.1992-04.com.emc:cx.virt2444cbsk5x.a1, portal: 172.12.25.33,3260]
Login to [iface: default, target: iqn.1992-04.com.emc:cx.virt2444cbsk5x.a1, portal: 172.12.25.33,3260] successful.

root@pve1:~# iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt2444cbsk5x.a2 -l
Logging in to [iface: default, target: iqn.1992-04.com.emc:cx.virt2444cbsk5x.a2, portal: 172.12.25.34,3260]
Login to [iface: default, target: iqn.1992-04.com.emc:cx.virt2444cbsk5x.a2, portal: 172.12.25.34,3260] successful.

root@pve1:~# iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt2444cbsk5x.a1 -p 172.12.25.33 --op update -n node.startup -v automatic
root@pve1:~# iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt2444cbsk5x.a2 -p 172.12.25.34 --op update -n node.startup -v automatic
```
### Storage配置
```
root@pve1:~# iscsiadm -m session --rescan
Rescanning session [sid: 1, target: iqn.1992-04.com.emc:cx.virt2444cbsk5x.a1, portal: 172.12.25.33,3260]
Rescanning session [sid: 2, target: iqn.1992-04.com.emc:cx.virt2444cbsk5x.a2, portal: 172.12.25.34,3260]

root@pve1:~# lsblk
NAME               MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda                  8:0    0  100G  0 disk
├─sda1               8:1    0 1007K  0 part
├─sda2               8:2    0  512M  0 part /boot/efi
└─sda3               8:3    0 99.5G  0 part
  ├─pve-swap       252:0    0    8G  0 lvm  [SWAP]
  ├─pve-root       252:1    0 34.9G  0 lvm  /
  ├─pve-data_tmeta 252:2    0    1G  0 lvm
  │ └─pve-data     252:4    0 42.2G  0 lvm
  └─pve-data_tdata 252:3    0 42.2G  0 lvm
    └─pve-data     252:4    0 42.2G  0 lvm
sdb                  8:16   0   30G  0 disk
sdc                  8:32   0   30G  0 disk
sr0                 11:0    1 1024M  0 rom


root@pve1:~# ls -l /dev/disk/by-path
total 0
lrwxrwxrwx 1 root root   9 Sep 25 16:19 ip-172.12.25.33:3260-iscsi-iqn.1992-04.com.emc:cx.virt2444cbsk5x.a1-lun-0 -> ../../sdb
lrwxrwxrwx 1 root root   9 Sep 25 16:19 ip-172.12.25.34:3260-iscsi-iqn.1992-04.com.emc:cx.virt2444cbsk5x.a2-lun-0 -> ../../sdc
```
### Multipath安裝
```
# Multipath線上安裝
root@pve1:~# apt install multipath-tools -y
Installing:
  multipath-tools

# Multipath離線安裝
root@pve1:~# tar -xvf multipath.tar
root@pve1:~# cd multipath
root@pve1:~/multipath# dpkg -i *.deb
  
root@pve1:~# systemctl enable multipathd && systemctl start multipathd

root@pve1:~# vi /etc/multipath.conf
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

root@pve1:~# reboot

root@pve1:~# multipath -ll
mpatha (360060160aaef60316c1f20699cb21938) dm-5 DGC,VRAID
size=30G features='1 queue_if_no_path' hwhandler='1 alua' wp=rw
`-+- policy='round-robin 0' prio=50 status=active
  |- 33:0:0:0 sdb 8:16 active ready running
  `- 34:0:0:0 sdc 8:32 active ready running

root@pve1:~# lsblk
NAME               MAJ:MIN RM  SIZE RO TYPE  MOUNTPOINTS
sda                  8:0    0  100G  0 disk
├─sda1               8:1    0 1007K  0 part
├─sda2               8:2    0  512M  0 part  /boot/efi
└─sda3               8:3    0 99.5G  0 part
  ├─pve-swap       252:0    0    8G  0 lvm   [SWAP]
  ├─pve-root       252:1    0 34.9G  0 lvm   /
  ├─pve-data_tmeta 252:2    0    1G  0 lvm
  │ └─pve-data     252:4    0 42.2G  0 lvm
  └─pve-data_tdata 252:3    0 42.2G  0 lvm
    └─pve-data     252:4    0 42.2G  0 lvm
sdb                  8:16   0   30G  0 disk
└─mpatha           252:5    0   30G  0 mpath
sdc                  8:32   0   30G  0 disk
└─mpatha           252:5    0   30G  0 mpath
sr0                 11:0    1 1024M  0 rom
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
root@pve1:~# lvcreate -l 100%FREE --thinpool andy_thinpool andy_vg
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
