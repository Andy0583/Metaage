## VPLEX Reset
### 斷開Cluster
* Storage View要砍掉
* 若為Metro架構，需於Cluster 2先斷開Cluster 1 director
```
VPlexcli:/> disconnect -n director-1-1-A
VPlexcli:/> disconnect -n director-1-1-B
```

### 清除System Volumes
```
VPlexcli:/> ll /clusters/cluster-1/system-volumes

/clusters/cluster-1/system-volumes:
Name                                 Volume Type  Operational  Health  Active  Ready  Geometry  Component  Block     Block  Capacity  Slots
-----------------------------------  -----------  Status       State   ------  -----  --------  Count      Count     Size   --------  -----
-----------------------------------  -----------  -----------  ------  ------  -----  --------  ---------  --------  -----  --------  -----
meta-volume                          meta-volume  ok           ok      true    true   raid-1    2          20446976  4K     78G       64000
meta-volume_backup_2024Jun11_064729  meta-volume  ok           ok      false   true   raid-1    1          20971264  4K     80G       64000
meta-volume_backup_2024Jun11_064850  meta-volume  ok           ok      false   true   raid-1    1          20971264  4K     80G       64000

VPlexcli:/> meta-volume destroy --meta-volume meta-volume_backup_2024Jun11_064729

Meta-volume 'meta-volume_backup_2024Jun11_064729' will be destroyed. Do you wish to continue?  (Yes/No) yes

VPlexcli:/> meta-volume destroy --meta-volume meta-volume_backup_2024Jun11_064850

Meta-volume 'meta-volume_backup_2024Jun11_064850' will be destroyed. Do you wish to continue?  (Yes/No) yes

VPlexcli:/> script -i VPlexadmin

VPlexcli:/> configuration meta-volume-cleanup

Are you sure you want to continue and delete the active meta-volume on this cluster? (Y/N): Y

To show that you understand the risks involved and still desire to remove the active meta-volume
enter REMOVE (case sensitive):REMOVE
```

### 開始Reset
* 兩邊都清掉Metavolume後在開始
```
VPlexcli:/> configuration system-reset

Do you want to continue? (Y/N): Y
```

## VPLEX Upgrade
### 下載檔案
* VPlex-version-management-server-package.tar
* VPlex-version-director-firmware-package.tar
* 上傳至MGMT Server /tmp
### 升級作業
```
VPlexcli:/> version -a

service@mgmt-1:~> cd /tmp

service@mgmt-1:/tmp> ll VPlex-6.2.0.07*.*

service@ManagementServer:~> VPlex-MS-installer --skip-package-verification /tmp/VPlex-6.2.0.07.00.02-management-server-package.tar

VPlexcli:/> ndu pre-config-upgrade -u /tmp/VPlex-6.2.0.07.00.02-director-firmware-package.tar

VPlexcli:/> version -a
```
