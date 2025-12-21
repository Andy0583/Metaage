## 初始設定
### 時間校時
```
nano /etc/chrony/chrony.conf
======================
# 註解掉
#pool 2.debian.pool.ntp.org iburst
# 增加
server 172.12.25.51 iburst
======================
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

## Multipath安裝
```
# 方式一：線上安裝(所有Node皆需安裝)
apt install multipath-tools -y

# 方式二：離線安裝(所有Node皆需安裝)
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

## iSCSI設定
```
# iSCSI Discovery
iscsiadm -m discovery -t st -p 10.10.130.241:3260
iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt2549tprtqf.a2 -l
iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt2549tprtqf.a3 -l
iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt2549tprtqf.a2 -p 10.10.130.241 --op update -n node.startup -v automatic
iscsiadm -m node -T iqn.1992-04.com.emc:cx.virt2549tprtqf.a3 -p 10.10.131.241 --op update -n node.startup -v automatic

# 查詢PVE iqn
cat /etc/iscsi/initiatorname.iscsi

# 重新掃描Disk
iscsiadm -m session --rescan
lsblk
```

## Director over iSCSI
```
＃ fdisk
root@pve1:~# fdisk /dev/mapper/mpatha

Command (m for help): n

Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p):

Using default response p.
Partition number (1-4, default 1):
First sector (8192-104857599, default 8192):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (8192-104857599, default 104857599):

Command (m for help): w

# Format
root@pve1:~# mkfs.xfs /dev/mapper/mpatha-part1

# Mount
root@pve1:~# mkdir -p /mnt/unity-iscsi

root@pve1:~# mount /dev/mapper/mpatha-part1 /mnt/unity-iscsi

root@pve1:~# df -h
Filesystem                Size  Used Avail Use% Mounted on
udev                       16G     0   16G   0% /dev
tmpfs                     3.2G  1.2M  3.2G   1% /run
/dev/mapper/pve-root       35G  3.3G   29G  11% /
tmpfs                      16G   57M   16G   1% /dev/shm
tmpfs                     1.0M     0  1.0M   0% /run/credentials/systemd-journald.service
tmpfs                     5.0M     0  5.0M   0% /run/lock
tmpfs                      16G     0   16G   0% /tmp
/dev/fuse                 128M   28K  128M   1% /etc/pve
tmpfs                     3.2G  4.0K  3.2G   1% /run/user/0
tmpfs                     1.0M     0  1.0M   0% /run/credentials/getty@tty1.service
/dev/mapper/mpatha-part1   50G 1013M   49G   2% /mnt/unity-iscs
```

## LVM
### 建置LVM
```
root@pve1:~# pvcreate /dev/mapper/mpatha  （每台Node都做）
  Physical volume "/dev/mapper/mpatha" successfully created.

root@pve1:~# vgcreate lvm_vg /dev/mapper/mpatha
  Volume group "lvm_vg" successfully created

# 使用LVM-thin需多加下列步驟
root@pve1:~# lvcreate -l 100%FREE --thinpool thinpool lvm_vg
  Thin pool volume with chunk size 64.00 KiB can address at most <15.88 TiB of data.
  Logical volume "thinpool" created.
```

### 移除LVM
```
root@pve1:~# vgs
  VG         #PV #LV #SN Attr   VSize   VFree
  lvm_vg       1   0   0 wz--n- <30.00g <30.00g
  lvmthin_vg   1   1   0 wz--n- <30.00g      0
  pve          1   4   0 wz--n- <99.50g <12.38g
  
root@pve1:~# lvremove lvmthin_vg
Do you really want to remove active logical volume lvmthin_vg/thinpool? [y/n]: y
  Logical volume "thinpool" successfully removed.
  
root@pve1:~# vgremove lvmthin_vg
  Volume group "lvmthin_vg" successfully removed

# 每台Node皆需執行
root@pve1:~# pvremove /dev/sdd
  Labels on physical volume "/dev/sdd" successfully wiped.
```

## BTRFS
### 建立BTRFS
```
root@pve1:~# mkfs.btrfs /dev/mapper/mpatha -f
btrfs-progs v6.14
See https://btrfs.readthedocs.io for more information.

Label:              (null)
UUID:               d3df7d66-ea7f-4e93-9e27-8b6dfe7bf455
Node size:          16384
Sector size:        4096        (CPU page size: 4096)
Filesystem size:    40.00GiB
Block group profiles:
  Data:             single            8.00MiB
  Metadata:         DUP             256.00MiB
  System:           DUP               8.00MiB
SSD detected:       no
Zoned device:       no
Features:           extref, skinny-metadata, no-holes, free-space-tree
Checksum:           crc32c
Number of devices:  1
Devices:
   ID        SIZE  PATH
    1    40.00GiB  /dev/mapper/mpatha

root@pve1:~# mkdir /mnt/btrfs-iscsi

root@pve1:~# mount /dev/mapper/mpatha /mnt/btrfs-iscsi

root@pve1:~# btrfs subvolume create /mnt/btrfs-iscsi/data
Create subvolume '/mnt/btrfs-iscsi/data'
```

### 移除BTRFS
```
root@pve1:~# mount /dev/mapper/mpatha /mnt/btrfs-iscsi

root@pve1:~# btrfs subvolume delete /mnt/btrfs-iscsi/data
Delete subvolume 256 (no-commit): '/mnt/btrfs-iscsi/data'

root@pve1:~# umount /mnt/btrfs-iscsi

root@pve1:~# rmdir /mnt/btrfs-iscsi
```
## 離線安裝Ceph
```
#上傳ceph至PVE上
cd ceph
dpkg -i *.deb
```
