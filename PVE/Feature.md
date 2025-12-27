## Replication
### 基本介紹
- Replication 為 PVE 內建功能，以 VM 為單位需手動進行設定
- Replication 需搭配 ZFS Storage 才能使用，且每台 ZFS Storage 命名皆需相同
- 為增量同步進行抄寫，抄寫可自訂頻率，最低為一分鐘一次

### 切換方式
- PVE 會自動將三台 Node 上的 /etc/pve/nodes 資料保持同步狀態
- 此資料紀錄著彼此每個 Node 上的 VM 設定檔
  ![](./image/007.png)
- PVE1 故障時，需在 PVE2 主機上，將原位於 pve1 資料夾中的 100.conf 移至 pve2 資料夾，並啟動 VM1
- PVE3 會隨著 PVE2 資料夾變更而同步更新，PVE1 修復後亦會與 PVE2 保持設定檔同步
  ![](./image/008.png)
