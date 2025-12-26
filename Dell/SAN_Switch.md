## SAN SW初始建置
* Console連線（Serial Line：COMx、Speed：9600） / 或使用SSH（預設IP：10.77.77.77 ）：帳號: admin、密碼: password
### 初始化
```
switch:admin> switchdisable
switch:admin> configdefault
switch:admin> reboot

# IP不會變更，若需變更需手動
switch:admin> ipaddrset     
DHCP [Off]:
Ethernet IP Address [10.77.77.77]:192.168.0.78
Ethernet Subnet mask [255.255.255.0]:
Gateway IP Address [10.77.77.1]:0.0.0.0
IP address is being changed...

# 修改Domain ID
switch:admin> switchdisable

switch:admin> configure
Fabric parameters (yes, y, no, n): [no] y
Domain: (1..239) [1] 3
【Ctrl-d】

switch:admin> switchEnable

switch:admin> fabricshow
```

### 新增指令
1、Alias：先將設備連同Port取個看得懂名稱，如andy_p1等。<br>
2、Zone：讓有關聯性的Alas放在一起，彼此才能溝通。<br>
3、Config：如登記表，登記哪些Zone需要啟用。
```
# 查看Port是否Online，相關WWPN
switchshow

# 新增設備Alias
alicreate "aliname","21:00...."

# 新增Zone
zonecreate "zonename ","member[; member...]"

# 將Zone加入到Confid中
cfgadd "cfgname","zonename"

# 若為新的SAN Switch，則需先建立Config檔案
cfgcreate "cfg","mn1-b1_ps3000;mn1-b1_ps500;mn2-b1_ps3000;mn2-b1_ps500"

# 將修改後Config檔案進行儲存
cfgsave

# 讓修改後Config檔案正式生效
cfgenable "cfg"
```

### 移除指令
```
# 將待移除Zone，移出Config檔案
cfgremove "cfg", "Servername_hba2_Arrayname_SPA2"

# 刪除Zone
zonedelete "Servername_hba2_Arrayname_SPA2"

# 刪除Alias
alidelete "Servername_hba2"

# 將修改後Config檔案進行儲存
cfgsave

# 讓修改後Config檔案正式生效
cfgenable "cfg"
```

## 維護相關作業
### Supportsave 收集
```
STG6520B:FID128:admin> supportsave
This command collects RASLOG, TRACE, supportShow, core file, FFDC data
and then transfer them to a FTP/SCP/SFTP server or a USB device.
This operation can take several minutes.
NOTE: supportSave will transfer existing trace dump file first, then
automatically generate and transfer latest one. There will be two trace dump
files transferred after this command.
OK to proceed? (yes, y, no, n): [no] y

Host IP or Host Name: 10.138.228.100
User Name: andyhsu
Password: 
Protocol (ftp | scp | sftp): sftp
SCP/SFTP Server Port Number [22]: 
Remote Directory: /Users/andyhsu/Desktop
Do you want to continue with CRA (Y/N) [N]: 
Saving support information for switch:STG6520B, module:RAS...
.......................................................................................... 
 
Saving support information for switch:STG6520B, module:FTR_START...
Saving support information for switch:STG6520B, module:CTRACE_OLD...
Saving support information for switch:STG6520B, module:CTRACE_OLD_MNT...
Saving support information for switch:STG6520B, module:CTRACE_NEW...
Saving support information for switch:STG6520B, module:SSHOW_SYS...
................................................ 
```

### FOS Upgrade
```
1.switchdisable

2.configupload(備份Config)
Protocol (scp, ftp, sftp, local) [ftp]:
Server Name or IP Address [host]: 10.97.20.33
User Name [user]:anonymous
Path/Filename [<home dir>/config.txt]: /79.txt
Section (all|chassis|switch [all]):
Password:
configUpload complete: All selected config parameters are uploaded

3.firmwaredownload
Server Name or IP Address: 10.77.77.93
User Name: anonymous
File Name: /v7.0.1b  #解壓縮成一個目錄
Network Protocol(1-auto-select, 2-FTP, 3-SCP, 4-SFTP) [1]: 2
Password:anonymous
Server IP: 10.77.77.93, Protocol IPv4
Checking system settings for firmwaredownload...
System settings check passed.
You can run firmwaredownloadstatus to get the status of this command.
This command will cause a warm/non-disruptive boot but will require that existing telnet, secure telnet or SSH sessions be restarted.
Do you want to continue (Y/N) [Y]: Y
Firmware is being downloaded to the switch. This step may take up to 30 minutes.
Preparing for firmwaredownload...
All packages have been downloaded successfully.
Firmware has been downloaded to the secondary partition of the switch.
HA Rebooting ...

4.version

5.configdownload(還原Config)
Protocol (scp, ftp, sftp, local) [ftp]:
Server Name or IP Address [host]: 10.77.77.93
User Name [user]: admin
Path/Filename [<home dir>/config.txt]: /78.txt
Section (all|chassis|switch [all]):
*** CAUTION ***
This command is used to download a backed-up configuration
for a specific switch. If using a file from a different
switch, this file's configuration settings will override
any current switch settings. Downloading a configuration
file, which was uploaded from a different type of switch,
may cause this switch to fail.
A switch reboot is required for some parameter changes to
take effect.
configDownload operation may take several minutes
to complete for large files.
Do you want to continue [y/n]: y

6.cfgsave

7.cfgenable CFGNAME

8.switchenable
```
