## VPLEX Metro Path測試
### 初始狀態
* 主機在C1，觀察Path狀態
```
PS C:\Users\Administrator> mpclaim -s -d 2

MPIO Disk2: 08 Paths, Round Robin with Subset, ALUA Not Supported
    Controlling DSM: Microsoft DSM
    SN: 6000144000000010301F14F9976C13A6
    Supported Load Balance Policies: FOO RR RRWS LQD WP LB

    Path ID          State              SCSI Address      Weight
    ---------------------------------------------------------------------------
    0000000077040009 Active/Optimized   004|000|009|001   0
    0000000077040008 Active/Optimized   004|000|008|001   0
    000000007704000b Active/Optimized   004|000|011|001   0
    000000007704000a Active/Optimized   004|000|010|001   0
    0000000077040005 Standby            004|000|005|001   0
    0000000077040004 Standby            004|000|004|001   0
    0000000077040007 Standby            004|000|007|001   0
    0000000077040006 Standby            004|000|006|001   0
```
### 移除C1 VPLEX FE
```
PS C:\Users\Administrator> mpclaim -s -d 2

MPIO Disk2: 04 Paths, Round Robin with Subset, ALUA Not Supported
    Controlling DSM: Microsoft DSM
    SN: 6000144000000010301F14F9976C13A6
    Supported Load Balance Policies: FOO RR RRWS LQD WP LB

    Path ID          State              SCSI Address      Weight
    ---------------------------------------------------------------------------
    0000000077040005 Standby            004|000|005|001   0
    0000000077040004 Standby            004|000|004|001   0
    0000000077040007 Standby            004|000|007|001   0
    0000000077040006 Active/Optimized   004|000|006|001   0
```
### 移除C2 40006 path
```
PS C:\Users\Administrator> mpclaim -s -d 2

MPIO Disk2: 04 Paths, Round Robin with Subset, ALUA Not Supported
    Controlling DSM: Microsoft DSM
    SN: 6000144000000010301F14F9976C13A6
    Supported Load Balance Policies: FOO RR RRWS LQD WP LB

    Path ID          State              SCSI Address      Weight
    ---------------------------------------------------------------------------
    0000000077040005 Standby            004|000|005|001   0
    0000000077040004 Standby            004|000|004|001   0
    0000000077040007 Active/Optimized   004|000|007|001   0
```
### 加回C2 40006 path
```
PS C:\Users\Administrator> mpclaim -s -d 2

MPIO Disk2: 04 Paths, Round Robin with Subset, ALUA Not Supported
    Controlling DSM: Microsoft DSM
    SN: 6000144000000010301F14F9976C13A6
    Supported Load Balance Policies: FOO RR RRWS LQD WP LB

    Path ID          State              SCSI Address      Weight
    ---------------------------------------------------------------------------
    0000000077040005 Standby            004|000|005|001   0
    0000000077040004 Standby            004|000|004|001   0
    0000000077040007 Active/Optimized   004|000|007|001   0
    0000000077040006 Standby            004|000|006|001   0
```
### 移除C2 40007 path
```
PS C:\Users\Administrator> mpclaim -s -d 2

MPIO Disk2: 04 Paths, Round Robin with Subset, ALUA Not Supported
    Controlling DSM: Microsoft DSM
    SN: 6000144000000010301F14F9976C13A6
    Supported Load Balance Policies: FOO RR RRWS LQD WP LB

    Path ID          State              SCSI Address      Weight
    ---------------------------------------------------------------------------
    0000000077040005 Standby            004|000|005|001   0
    0000000077040004 Active/Optimized   004|000|004|001   0
    0000000077040006 Standby            004|000|006|001   0
```
### 加回C2 40007 path
```
PS C:\Users\Administrator> mpclaim -s -d 2

MPIO Disk2: 04 Paths, Round Robin with Subset, ALUA Not Supported
    Controlling DSM: Microsoft DSM
    SN: 6000144000000010301F14F9976C13A6
    Supported Load Balance Policies: FOO RR RRWS LQD WP LB

    Path ID          State              SCSI Address      Weight
    ---------------------------------------------------------------------------
    0000000077040005 Standby            004|000|005|001   0
    0000000077040004 Active/Optimized   004|000|004|001   0
    0000000077040007 Standby            004|000|007|001   0
    0000000077040006 Standby            004|000|006|001   0
```
### 加回C1 VPLEX FE
```
PS C:\Users\Administrator> mpclaim -s -d 2

MPIO Disk2: 08 Paths, Round Robin with Subset, ALUA Not Supported
    Controlling DSM: Microsoft DSM
    SN: 6000144000000010301F14F9976C13A6
    Supported Load Balance Policies: FOO RR RRWS LQD WP LB

    Path ID          State              SCSI Address      Weight
    ---------------------------------------------------------------------------
    0000000077040008 Active/Optimized   004|000|008|001   0
    0000000077040009 Active/Optimized   004|000|009|001   0
    000000007704000a Active/Optimized   004|000|010|001   0
    000000007704000b Active/Optimized   004|000|011|001   0
    0000000077040005 Standby            004|000|005|001   0
    0000000077040004 Standby            004|000|004|001   0
    0000000077040007 Standby            004|000|007|001   0
    0000000077040006 Standby            004|000|006|001   0
```
### 再次移除C1 VPLEX FE
```
PS C:\Users\Administrator> mpclaim -s -d 2

MPIO Disk2: 04 Paths, Round Robin with Subset, ALUA Not Supported
    Controlling DSM: Microsoft DSM
    SN: 6000144000000010301F14F9976C13A6
    Supported Load Balance Policies: FOO RR RRWS LQD WP LB

    Path ID          State              SCSI Address      Weight
    ---------------------------------------------------------------------------
    0000000077040005 Standby            004|000|005|001   0
    0000000077040004 Active/Optimized   004|000|004|001   0
    0000000077040007 Standby            004|000|007|001   0
    0000000077040006 Standby            004|000|006|001   0
```
