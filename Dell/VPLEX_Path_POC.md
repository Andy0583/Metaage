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
## Linux Path初始狀態
```
[root@localhost vdbench]# multipath -ll
mpatha (36000144000000010301f14f9976c1398) dm-0 EMC,Invista
size=33G features='1 queue_if_no_path' hwhandler='0' wp=rw
|-+- policy='service-time 0' prio=20 status=enabled
| |- 12:0:1:0 sdc 8:32  active ready running
| |- 12:0:6:0 sde 8:64  active ready running
| `- 12:0:3:0 sdg 8:96  active ready running
`-+- policy='service-time 0' prio=15 status=enabled
  |- 12:0:5:0 sdi 8:128 active ready running
  |- 12:0:7:0 sdk 8:160 active ready running
  |- 12:0:2:0 sdm 8:192 active ready running
  `- 12:0:4:0 sdo 8:224 active ready running

mpathb (36000144000000010301f14f9976c13b2) dm-2 EMC,Invista
size=100G features='1 queue_if_no_path' hwhandler='0' wp=rw
|-+- policy='service-time 0' prio=20 status=active
| |- 12:0:0:1 sdb 8:16  active ready running
| |- 12:0:1:1 sdd 8:48  active ready running
| |- 12:0:6:1 sdf 8:80  active ready running
| `- 12:0:3:1 sdh 8:112 active ready running
`-+- policy='service-time 0' prio=15 status=enabled
  |- 12:0:5:1 sdj 8:144 active ready running
  |- 12:0:7:1 sdl 8:176 active ready running
  |- 12:0:2:1 sdn 8:208 active ready running
  `- 12:0:4:1 sdp 8:240 active ready running
```
