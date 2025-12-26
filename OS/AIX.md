## FC adapter
* 若為VIOS架構，實體HBA卡為10：XX，VIOS會出現虛擬HBA卡給內部LPAR C0:XX使用。
* SAN SW Zoning若要給VIOS綁實體卡，若要給裡面的LPAR綁虛擬卡(無須綁實體卡)。
* Zoning前AIX需先打光才認得到。

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

## AIX ODM安裝
* UDID (Unique device identifier)：Device唯一識別碼。
  * "cfgmgr" command執行時，就會依據UUID來判斷該Device是一顆獨立新的Device，還是為既有Device多條路徑而已。
* AIX ODM (Object Data Manager)功能：
  * 通常由儲存廠商提供。
  * 讓AIX可辨識磁碟的廠商、型號及最佳化參數。
  * 讓MPIO（多路徑 I/O）或 PowerPath 等多路徑軟體，能正確識別路徑，避免負載不均或容錯失效。（ODM不包含MPIO）
  * 某些特定屬性（如 queue depth、reserve policy、failover mode）能自動設定最佳值。
  * "lsdev"、"lscfg"顯示的資訊較為完整。
  * 某些 EMC 專用功能（如 Symmetrix 磁碟類型標註）可以使用。
