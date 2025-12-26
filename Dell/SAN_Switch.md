## SAN SW相關指令
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
```

### 新增指令
1、Alias：先將設備連同Port取個看得懂名稱，如andy_p1等。
2、Zone：讓有關聯性的Alas放在一起，彼此才能溝通。
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
cfgenable "cfgname"
```
