# Dell PowerStoreOS 4.3.0.0 Release Notes
### 新功能（主要功能)
* 30 TB QLC SSD： PowerStore 3200Q 和 5200Q新增支援30TB SSD。
* Fast drive copy：當SSD損耗到達97%，系統將自動資料複製到其它SSD上。
* 多方授權：啟用後關鍵作業（如刪除），需要其它User二次批准才能繼續。
* NFSv4.2：新增支援NFSv4.2。
* Synchronous replication over Fibre Channel：新增對Block使用FC進行Sync Replication。(必須使用SAN SW)
* Asynchronous replication over Fibre Channe：新增對File使用FC進行Async Replication。(必須使用SAN SW)
* File Metro：NAS使用Witness，可達成自動切換（MetroSync）。

#### 備註：PowerStore 4.3之後，無論Block / File都支援FC / TCP進行Sync / Async。

### 已解決問題
https://www.dell.com/support/manuals/en-us/powerstore-9200t/pwrstr-4-3-rn/resolved-issues?guid=guid-ac452f77-359e-4c58-94e4-eb961aeb9fd8&lang=en-us

### 已知問題
https://www.dell.com/support/manuals/en-us/powerstore-9200t/pwrstr-4-3-rn/known-issues?guid=guid-c655cc3d-d9b7-4067-ba95-9f155c45b601&lang=en-us
