## 初始設定
```
# 時間校時
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

# 線上更新
rm /etc/apt/sources.list.d/pve-enterprise.sources
rm /etc/apt/sources.list.d/ceph.sources
sed -i 's|http://ftp.debian.org|https://mirrors.ustc.edu.cn|g' /etc/apt/sources.list
sed -i 's|http://security.debian.org|https://mirrors.ustc.edu.cn/debian-se...|g' /etc/apt/sources.list
apt update && apt full-upgrade -y

# 移除未訂閱
sed -i.bak "s/data.status.toLowerCase() !== 'active'/false/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
systemctl restart pveproxy.service
```

## Multipath安裝(所有Node皆需安裝)
```
# 方式一：線上安裝
apt install multipath-tools -y

# 方式二：離線安裝
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

## 建立Director over iSCSI(無法Share，每台Node各自獨立)
```
＃ fdisk
root@pve1:~# fdisk /dev/mapper/mpatha

Welcome to fdisk (util-linux 2.41).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS (MBR) disklabel with disk identifier 0x2f7cdcd9.

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p):

Using default response p.
Partition number (1-4, default 1):
First sector (8192-104857599, default 8192):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (8192-104857599, default 104857599):

Created a new partition 1 of type 'Linux' and of size 50 GiB.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Re-reading the partition table failed.: Invalid argument

The kernel still uses the old table. The new table will be used at the next reboot or after you run partprobe(8) or partx(8).

# Format
root@pve1:~# mkfs.xfs /dev/mapper/mpatha-part1
meta-data=/dev/mapper/mpatha-part1 isize=512    agcount=16, agsize=819136 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=1
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=1
         =                       exchange=0   metadir=0
data     =                       bsize=4096   blocks=13106176, imaxpct=25
         =                       sunit=2      swidth=1024 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1, parent=0
log      =internal log           bsize=4096   blocks=16384, version=2
         =                       sectsz=512   sunit=2 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
         =                       rgcount=0    rgsize=0 extents
Discarding blocks...Done.

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

## 建置LVM
```
# LVM建置
root@pve1:~# pvcreate /dev/mapper/mpatha  （每台Node都做）
  Physical volume "/dev/mapper/mpatha" successfully created.

root@pve1:~# vgcreate lvm_vg /dev/mapper/mpatha
  Volume group "lvm_vg" successfully created

# LVM-thin建置
root@pve1:~# pvcreate /dev/mapper/mpatha
  Physical volume "/dev/mapper/mpatha" successfully created.

root@pve1:~# vgcreate lvmthin_vg /dev/mapper/mpatha
  Volume group "lvm_vg" successfully created

root@pve1:~# lvcreate -l 100%FREE --thinpool thinpool lvmthin_vg
  Thin pool volume with chunk size 64.00 KiB can address at most <15.88 TiB of data.
  Logical volume "thinpool" created.

# 其餘Node執行下列命令
root@pve2:~# pvscan
  PV /dev/sda3            VG pve      lvm2 [<99.50 GiB / <12.38 GiB free]
  PV /dev/mapper/mpatha   VG lvm_vg   lvm2 [<40.00 GiB / <40.00 GiB free]
  Total: 2 [139.49 GiB] / in use: 2 [139.49 GiB] / in no VG: 0 [0   ]

root@pve2:~# vgscan
  Found volume group "pve" using metadata type lvm2
  Found volume group "lvm_vg" using metadata type lvm2

lvscan
```
## BTRFS建立
```
＃ 建立磁碟（每台Node皆需要設定）
mkfs.btrfs /dev/sdb
mkdir /mnt/btrfs-date
mount /dev/sdb /mnt/btrfs-data
btrfs subvolume create /mnt/btrfs-data/data

# Multipath
mkfs.btrfs /dev/mapper/mpatha -f
mkdir /mnt/btrfs-iscsi
mount /dev/mapper/mpatha /mnt/btrfs-iscsi
btrfs subvolume create /mnt/btrfs-iscsi/data
＃至GUI上建立Storage
```
## 離線安裝Ceph
### Ceph安裝
```
#上傳ceph至PVE上
cd ceph
dpkg -i *.deb
```
