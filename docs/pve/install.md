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

### **<font color="red">Multipath設定</font>** 
**安裝Multipath(離線)**
```
root@pve1:~# cat /sys/class/fc_host/host*/port_name
0x2100f4e9d452d3c8
0x2100f4e9d452d3c9

root@pve1:~# cd multipath/

root@pve1:~/multipath# dpkg -i *.deb

root@pve1:~# vi /etc/multipath.conf
defaults {
    user_friendly_names yes
    find_multipaths yes
    path_grouping_policy    multibus
    path_selector           "round-robin 0"
    failback                immediate
    rr_min_io               100
    max_fds                 max
    rr_weight               priorities
}

blacklist {
    devnode "^sda" 
}

root@pve1:~# systemctl enable --now multipathd

root@pve1:~# reboot
```

**檢查是否啟用**
```
root@pve1:~# lsblk
NAME               MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda                  8:0    0   300G  0 disk
├─sda1               8:1    0  1007K  0 part
├─sda2               8:2    0     1G  0 part
└─sda3               8:3    0   299G  0 part
  ├─pve-swap       252:0    0     8G  0 lvm   [SWAP]
  ├─pve-root       252:1    0  84.7G  0 lvm   /
  ├─pve-data_tmeta 252:2    0   1.9G  0 lvm
  │ └─pve-data     252:4    0 186.4G  0 lvm
  └─pve-data_tdata 252:3    0 186.4G  0 lvm
    └─pve-data     252:4    0 186.4G  0 lvm
sdb                  8:16   0    22G  0 disk
└─mpathc           252:5    0    22G  0 mpath
sdc                  8:32   0    22G  0 disk
└─mpathc           252:5    0    22G  0 mpath
sdd                  8:48   0    22G  0 disk
└─mpathc           252:5    0    22G  0 mpath
sde                  8:64   0    22G  0 disk
└─mpathc           252:5    0    22G  0 mpath

root@pve1:~# multipath -ll
mpathc (368ccf09800c8b3d1413bbd2d5dc575d2) dm-5 DellEMC,PowerStore
size=22G features='1 queue_if_no_path' hwhandler='1 alua' wp=rw
|-+- policy='round-robin 0' prio=50 status=active
| |- 33:0:1:1 sdb 8:16 active ready running
| `- 34:0:4:1 sde 8:64 active ready running
`-+- policy='round-robin 0' prio=10 status=enabled
  |- 33:0:2:1 sdc 8:32 active ready running
  `- 34:0:1:1 sdd 8:48 active ready running
```

### **<font color="red">iSCSI設定</font>** 
**建立iSCSI網路**
```
root@pve1:~# nano /etc/network/interfaces
auto lo
iface lo inet loopback

iface nic0 inet manual

auto vmbr0
iface vmbr0 inet static
        address 172.22.46.241/24
        gateway 172.22.46.254
        bridge-ports nic0
        bridge-stp off
        bridge-fd 0

iface nic1 inet manual
auto vmbr1
iface vmbr1 inet static
    address 192.168.130.233/24
    bridge-ports nic1
    bridge-stp off
    bridge-fd 0


iface nic2 inet manual
source /etc/network/interfaces.d/*

root@pve1:~# ifreload -a
```

**設定iSCSI**
```
root@pve1:~# iscsiadm -m discovery -t st -p 192.168.130.251:3260
192.168.130.253:3260,1 iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-a-32fb1648
192.168.130.252:3260,1 iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-b-569adeac

root@pve1:~# iscsiadm -m node -p 192.168.130.253 -T iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-a-32fb1648 --op update -n node.startup -v automatic

root@pve1:~# iscsiadm -m node -p 192.168.130.252 -T iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-b-569adeac --op update -n node.startup -v automatic

root@pve1:~# iscsiadm -m node -p 192.168.130.253 -T iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-a-32fb1648 --login
Login to [iface: default, target: iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-a-32fb1648, portal: 192.168.130.253,3260] successful.

root@pve1:~# iscsiadm -m node -p 192.168.130.252 -T iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-b-569adeac --login
Login to [iface: default, target: iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-b-569adeac, portal: 192.168.130.252,3260] successful.

root@pve1:~# cat /etc/iscsi/initiatorname.iscsi
InitiatorName=iqn.1993-08.org.debian:01:c36ce6f311d

# 於Storage進行空間配置
```

**檢查是否配置成功**
```
root@pve1:~# iscsiadm -m session --rescan
Rescanning session [sid: 1, target: iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-a-32fb1648, portal: 192.168.130.253,3260]
Rescanning session [sid: 2, target: iqn.2015-10.com.dell:dellemc-powerstore-ckm01211506594-b-569adeac, portal: 192.168.130.252,3260]

root@pve1:~# lsblk
NAME               MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda                  8:0    0   300G  0 disk
├─sda1               8:1    0  1007K  0 part
├─sda2               8:2    0     1G  0 part
└─sda3               8:3    0   299G  0 part
  ├─pve-swap       252:0    0     8G  0 lvm   [SWAP]
  ├─pve-root       252:1    0  84.7G  0 lvm   /
  ├─pve-data_tmeta 252:2    0   1.9G  0 lvm
  │ └─pve-data     252:4    0 186.4G  0 lvm
  └─pve-data_tdata 252:3    0 186.4G  0 lvm
    └─pve-data     252:4    0 186.4G  0 lvm
sdb                  8:16   0    22G  0 disk
└─mpathc           252:5    0    22G  0 mpath
sdc                  8:32   0    22G  0 disk
└─mpathc           252:5    0    22G  0 mpath
sdd                  8:48   0    22G  0 disk
└─mpathc           252:5    0    22G  0 mpath
sde                  8:64   0    22G  0 disk
└─mpathc           252:5    0    22G  0 mpath
sdf                  8:80   0    20G  0 disk
└─mpathd           252:6    0    20G  0 mpath
sdg                  8:96   0    20G  0 disk
└─mpathd           252:6    0    20G  0 mpath
sr0                 11:0    1  1024M  0 rom

root@pve1:~# multipath -ll
mpathc (368ccf09800c8b3d1413bbd2d5dc575d2) dm-5 DellEMC,PowerStore
size=22G features='1 queue_if_no_path' hwhandler='1 alua' wp=rw
|-+- policy='round-robin 0' prio=50 status=active
| |- 33:0:1:1 sdb 8:16 active ready running
| `- 34:0:4:1 sde 8:64 active ready running
`-+- policy='round-robin 0' prio=10 status=enabled
  |- 33:0:2:1 sdc 8:32 active ready running
  `- 34:0:1:1 sdd 8:48 active ready running
mpathd (368ccf098009f84617a2108af204566c5) dm-6 DellEMC,PowerStore
size=20G features='1 queue_if_no_path' hwhandler='1 alua' wp=rw
|-+- policy='round-robin 0' prio=50 status=active
| `- 36:0:0:1 sdg 8:96 active ready running
`-+- policy='round-robin 0' prio=10 status=enabled
  `- 35:0:0:1 sdf 8:80 active ready running
```
