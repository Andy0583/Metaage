## Log Collection
---
[Log Script檔案下載](https://download.graidtech.com/misc/tools/graid_log_collector/linux/graid_log_script.tar.gz)

**檔案解壓縮**
```
tar -xvf graid_log_script.tar.gz

._graid-logs-tool
tar: Ignoring unknown extended header keyword 'LIBARCHIVE.xattr.com.apple.macl'
graid-logs-tool/
graid-logs-tool/log_analysis.py
graid-logs-tool/log-collection-tool.md5
graid-logs-tool/graid-log-collector.sh
```

**執行Log收集**
```
bash graid-log-collector.sh

Checking network connectivity...
Network is not available.
Warning: Network is not available. Skipping update check.
==================== DISCLAIMER ====================
This tool will collect system and configuration data that may
contain sensitive information such as:
  - Hardware configuration details
  - System logs and crash information
  - Network configuration
  - Software version details
Review all collected data before sharing it externally.
Do you wish to continue? (y/n) Y

Checking dependencies...
Checking for system report tools...
All dependencies available.
Graid Log Collection Tool
Version: 1.0.0-20250506
Started at: Mon Aug 31 14:02:13 UTC 2026
Running on host: test
Output directory: logs-test-20260831
----------------------------------------
Scanning PCI devices...
[100%] Basic system information collected
Collecting system logs...logs
[100%] System logs collected
[100%] Resource usage information collected
[100%] Network information collected
[100%] Device Mapper information collected
[100%] BeeGFS information collected
[100%] NFS information collected
[100%] Samba information collected
[100%] SupremeRAID information collected
[100%] NVMe device information collected
[100%] NVMe LED configuration collected
[100%] System summary created
Log analysis complete.lysis
[100%] Log analysis completed
Creating sosreport (this may take some time)...
Compression completed: graid_log_2026-08-31.tar.gz
MD5 checksum saved to graid_log_2026-08-31.tar.gz.md5
Temporary files removed
[100%] Logs compressed: graid_log_2026-08-31.tar.gz
----------------------------------------
Script completed at: Mon Aug 31 02:07:54 PM UTC 2026
Thank you for using the Graid Log Collection Tool!
Please upload the compressed log file to Graid support team for analysis.
```

**檔案收集**
```
ll

total 9752
drwxr-xr-x 2  501 staff    4096 Aug 31 14:07 ./
drwxr-x--- 5 andy andy     4096 Aug 31 14:01 ../
-rw-r--r-- 1 root root  9760963 Aug 31 14:07 **graid_log_2026-08-31.tar.gz**
-rw-r--r-- 1 root root       62 Aug 31 14:07 graid_log_2026-08-31.tar.gz.md5
-rw-r--r-- 1  501 staff   83729 May  6  2025 graid-log-collector.sh
-rw-r--r-- 1  501 staff  114813 May  1  2025 log_analysis.py
-rw-r--r-- 1  501 staff      33 May  6  2025 log-collection-tool.md5
```
