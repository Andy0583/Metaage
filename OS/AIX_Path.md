## FC adapter
* 若為VIOS架構，實體HBA卡為10：XX，VIOS會出現虛擬HBA卡給內部LPAR C0:XX使用。
* SAN SW Zoning若要給VIOS綁實體卡，若要給裡面的LPAR綁虛擬卡(無須綁實體卡)。
* Zoning前AIX需先打光才認得到（cfgmgr）。

### 顯示可用FC adapter
```
# Available是裝置有抓到可使用，Defined是曾經抓到過，但現在離線了。
lsdev -C |grep FC

fscsi0     Available C2-T1-01    FC SCSI I/O Controller Protocol Device
fscsi1     Available C3-T1-01    FC SCSI I/O Controller Protocol Device
```

### 顯示FC adapter的WWPN
```
lscfg -vl fcs0

fcs0    U9009.22A.78BDBC0-V1-C2-T1  Virtual Fibre Channel Client Adapter
        Network Address.............C050760B94EC000C
        Device Specific.(Z0)........
        Device Specific.(Z1)........
        Device Specific.(Z2)........
        Device Specific.(Z3)........
        Device Specific.(Z4)........
        Device Specific.(Z5)........
        Device Specific.(Z6)........
        Device Specific.(Z7)........
        Device Specific.(Z8)........C050760B94EC000C
        Device Specific.(Z9)........
        Hardware Location Code......U9009.22A.78BDBC0-V1-C2-T1
```

## AIX ODM
* UDID (Unique device identifier)：Device唯一識別碼。
  * "cfgmgr" command執行時，就會依據UUID來判斷該Device是一顆獨立新的Device，還是為既有Device多條路徑而已。
* AIX ODM (Object Data Manager)功能：
  * 通常由儲存廠商提供。
  * 讓AIX可辨識磁碟的廠商、型號及最佳化參數。
  * 讓MPIO（多路徑 I/O）或 PowerPath 等多路徑軟體，能正確識別路徑，避免負載不均或容錯失效。（ODM不包含MPIO）
  * 某些特定屬性（如 queue depth、reserve policy、failover mode）能自動設定最佳值。
  * "lsdev"、"lscfg"顯示的資訊較為完整。
  * 某些 EMC 專用功能（如 Symmetrix 磁碟類型標註）可以使用。

### Dell ODM
* VPLEX ODM<br>
1、INVISTA AIX Support Software<br>
2、INVISTA FCP MPIO Support Software<br>
3、INVISTA FCP Support Software（有裝PowerPath才需要）<br>

* PowerStore ODM<br>
1、DellEMC PowerStore AIX Support Software<br>
2、DellEMC PowerStore FCP MPIO Support Software<br>
3、DellEMC PowerStore FCP Support Software（有裝PowerPath才需要）

### ODM安裝
```
# 從外部將檔案傳入AIX
scp -r /Users/andyhsu/Downloads/DellEMC.AIX.6.3.0.2 root@192.168.0.14:/usr/sys/inst.images

ssh root@192.168.0.14

# Disk顯示為Other
lsdev -Cc disk 
hdisk0 Available C2-T1-01 MPIO Other FC SCSI Disk Drive

# AIX安裝ODM
smit installp

select Install and Update from ALL Available Software
F4 [/usr/sys/inst.images (Installation Directory)] -- Enter -- F4  -- F7 -- Enter -- Enter -- F10

# 重新開機
shutdown -Fr

lslpp -l |grep Dell
EMC.INVISTA.aix.rte        6.3.0.2  COMMITTED  DellEMC INVISTA AIX Support 
EMC.INVISTA.fcp.MPIO.rte   6.3.0.2  COMMITTED  DellEMC INVISTA FCP MPIO
EMC.PowerStore.aix.rte     6.3.0.2  COMMITTED  DellEMC PowerStore AIX Support
                           6.3.0.2  COMMITTED  DellEMC PowerStore FCP MPIO

# Disk顯示為EMC
lsdev -Cc disk 
hdisk0 Available C2-T1-01 EMC INVISTA FCP MPIO Disk
```
## Path設定
### Path掃描、查詢
```
# 重新掃描，查看Path數量
cfgmgr

lspath -l hdisk2
Enabled hdisk2 fscsi1
Enabled hdisk2 fscsi1
Enabled hdisk2 fscsi0
Enabled hdisk2 fscsi0
Enabled hdisk2 fscsi0
Enabled hdisk2 fscsi0
Enabled hdisk2 fscsi1
Enabled hdisk2 fscsi1

# 查看MPIO storage devices(Target Port,LUN ID)
lsmpio -l hdisk2
name    path_id  status   path_status  parent  connection
hdisk2  0        Enabled  Sel          fscsi0  50001442807b6500,2000000000000
hdisk2  1        Enabled  Sel          fscsi0  50001442907b6500,2000000000000
hdisk2  2        Enabled  Sel          fscsi1  50001442807b6500,2000000000000
hdisk2  3        Enabled  Sel          fscsi1  50001442907b6500,2000000000000
hdisk2  4        Enabled  Sel          fscsi0  50001442901f1400,2000000000000
hdisk2  5        Enabled  Sel          fscsi0  50001442801f1400,2000000000000
hdisk2  6        Enabled  Sel          fscsi1  50001442901f1400,2000000000000
hdisk2  7        Enabled  Sel          fscsi1  50001442801f1400,2000000000000
```

### 設定Path Priority
```
# 優先權最高為255，1為最低
chpath -l hdisk2 -p fscsi1 -w 50001442901f1400,2000000000000 -a priority=255
chpath -l hdisk2 -p fscsi0 -w 50001442807b6500,2000000000000 -a priority=1

# 查看Path Priority
lspath -l hdisk2 -a priority -F value -p fscsi0 -w 50001442801f1400,2000000000000
255

lspath -l hdisk2 -a priority -F value -p fscsi0 -w 50001442901f1400,2000000000000
1
```

### 移除Path
```
rmdev -dl fcs0 -R

cfgmger
```

### AIX algorithm（Path Policy）
* 安裝完Dell ODM後，一律自動改為RR，且無法變更。
* 設定為shortest_queue時，Path Priority無作用。
* “Sel”為可選擇Path。
* 變更algorithm不需重開。
```
# 設定為Fail_Over：只有一條在送流量
chdev -l hdisk0 -a algorithm=fail_over -P

lsmpio -l hdisk1
name    path_id  status   path_status  parent  connection
hdisk1  0        Enabled  Sel          fscsi0  50001442901f1400,1000000000000
hdisk1  1        Enabled               fscsi0  50001442801f1400,1000000000000
hdisk1  2        Enabled               fscsi0  50001442807b6500,1000000000000
hdisk1  3        Enabled               fscsi0  50001442907b6500,1000000000000
hdisk1  4        Enabled               fscsi1  50001442901f1400,1000000000000
hdisk1  5        Enabled               fscsi1  50001442801f1400,1000000000000
hdisk1  6        Enabled               fscsi1  50001442807b6500,1000000000000
hdisk1  7        Enabled               fscsi1  50001442907b6500,1000000000000

# 設定為RR：負載平衡，但若有條高延遲Path依舊會使用
chdev -l hdisk2 -a algorithm=round_robin -P

lsmpio -l hdisk2
name    path_id  status   path_status  parent  connection
hdisk2  0        Enabled  Sel          fscsi0  50001442807b6500,2000000000000
hdisk2  1        Enabled  Sel          fscsi0  50001442907b6500,2000000000000
hdisk2  2        Enabled  Sel          fscsi1  50001442807b6500,2000000000000
hdisk2  3        Enabled  Sel          fscsi1  50001442907b6500,2000000000000
hdisk2  4        Enabled  Sel          fscsi0  50001442901f1400,2000000000000
hdisk2  5        Enabled  Sel          fscsi0  50001442801f1400,2000000000000
hdisk2  6        Enabled  Sel          fscsi1  50001442901f1400,2000000000000
hdisk2  7        Enabled  Sel          fscsi1  50001442801f1400,2000000000000

# 設定為shortest_queue：動態智慧型負載平衡，觀察每條Path佇列，最少的優先傳送
chdev -l hdisk2 -a algorithm=shortest_queue -P

lsmpio -l hdisk3
name    path_id  status   path_status  parent  connection
hdisk3  0        Enabled  Sel          fscsi0  50001442807b6500,3000000000000
hdisk3  1        Enabled  Sel          fscsi0  50001442907b6500,3000000000000
hdisk3  2        Enabled  Sel          fscsi1  50001442807b6500,3000000000000
hdisk3  3        Enabled  Sel          fscsi1  50001442907b6500,3000000000000
hdisk3  4        Enabled  Sel          fscsi0  50001442901f1400,3000000000000
hdisk3  5        Enabled  Sel          fscsi0  50001442801f1400,3000000000000
hdisk3  6        Enabled  Sel          fscsi1  50001442901f1400,3000000000000
hdisk3  7        Enabled  Sel          fscsi1  50001442801f1400,3000000000000
```
