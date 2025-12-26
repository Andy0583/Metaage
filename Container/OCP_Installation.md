# OCP安裝

### 安裝bastion
* 4core/8G/100G
* 安裝RHEL 9.1(DNS指向自己)
* 標準安裝（IP 192.168.0.211為範例）

### 掛載ISO為repo

```bash
# 將OS ISO上傳至bastion中
mkdir /var/repo
mount -o loop rhel-baseos-9.1-x86_64-dvd.iso /var/repo/

vi /etc/yum.repos.d/rhel9-local.repo
[Local-BaseOS]
name=Red Hat Enterprise Linux 9 - BaseOS
metadata_expire=-1
gpgcheck=1
enabled=1
baseurl=file:///var/repo//BaseOS/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release
[Local-AppStream]
name=Red Hat Enterprise Linux 9 - AppStream
metadata_expire=-1
gpgcheck=1
enabled=1
baseurl=file:///var/repo//AppStream/
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release

yum clean all
subscription-manager clean

vi /etc/yum/pluginconf.d/subscription-manager.conf
enabled=0
```

### 關閉防火牆

```bash
systemctl stop firewalld
systemctl disable firewalld
```

### 安裝Bind

```bash
yum install bind bind-utils -y

vi /etc/named.conf
options {
        listen-on port 53 { any; };
#       listen-on-v6 port 53 { ::1; };
        allow-query     { any; };
	forwarders { 8.8.8.8; };

        dnssec-enable no;
        dnssec-validation no;

zone "ocp.andy.com" IN {
        type master;
        file "named.ocp.andy.com";
};

zone "25.12.172.in-addr.arpa" IN {
        type master;
        file "rev.25.12.172";
};
```

```bash
vi /var/named/named.ocp.andy.com
$TTL 1D
@       IN SOA  @ bastion.ocp.andy.com. (
                                        2020040819      ; serial
                                        3H      ; refresh
                                        15M     ; retry
                                        1W      ; expire
                                        1D )    ; minimum
@       IN NS   bastion.ocp.andy.com.
@       IN A    172.12.25.41

bastion         IN      A       172.12.25.41
master-1        IN      A       172.12.25.42
master-2        IN      A       172.12.25.43
master-3        IN      A       172.12.25.44
worker-1        IN      A       172.12.25.45
worker-2        IN      A       172.12.25.46
worker-3        IN      A       172.12.25.47
api             IN      A       172.12.25.48
*.apps          IN      A       172.12.25.49
```

```bash
vi /var/named/rev.25.12.172
$TTL 1D
@       IN SOA  @ bastion.ocp.andy.com. (
                                        2020040819      ; serial
                                        1D      ; refresh
                                        1H      ; retry
                                        1W      ; expire
                                        3H )    ; minimum
@       IN NS   bastion.ocp.andy.com.

25.12.172.in-addr.arpa      IN      PTR     bastion.ocp.andy.com

41   IN      PTR     bastion.ocp.andy.com.
42   IN      PTR     master-1.ocp.andy.com.
43   IN      PTR     master-2.ocp.andy.com.
44   IN      PTR     master-3.ocp.andy.com.
45   IN      PTR     worker-1.ocp.andy.com.
46   IN      PTR     worker-2.ocp.andy.com.
47   IN      PTR     worker-3.ocp.andy.com.
48   IN      PTR     api.ocp.andy.com.

chgrp named /var/named/named.ocp.andy.com
chmod 640 /var/named/named.ocp.andy.com
chgrp named /var/named/rev.25.12.172
chmod 640 /var/named/rev.25.12.172

systemctl enable named
systemctl start named
systemctl status named
```

### 安裝DHCP(或者直接用MAC指定IP)

```bash
yum install dhcp-server -y

vi /etc/dhcp/dhcpd.conf
default-lease-time 3600;
max-lease-time 86400;
authoritative;
subnet 172.12.25.0 netmask 255.255.255.0 {
    range 172.12.25.42 172.12.25.47;
    option routers 172.12.25.254;
    option subnet-mask 255.255.255.0;
    option domain-name-servers 172.12.25.41;
}

systemctl enable --now dhcpd
systemctl status dhcpd
```

### 產生SSH

```bash
ssh-keygen -t rsa -b 4096 -N '' -f ~/.ssh/id_rsa
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
cat /root/.ssh/id_rsa.pub
```

### 取得Discovery ISO

* https://console.redhat.com/openshift
* Create Cluster - DataCenter - Bare Metal (x86_64) - Bare Metal (x86_64) - Interactive (4.15)
* Cluster Name：ocp / Base domain：andy.com / DHCP only
* Add Host - Full Image - SSH public key(貼上剛產生) - Generate Discovery ISO - Download Discovery ISO

### 建立Master及Worker

* 建立VM（Master Core 8 / MEM 20G /HD 100GB + 30GB）X 3、（Worker Core 16 / MEM 32G /HD 100GB + 30GB）X 3
* CPU需啟動虛擬化（OCPv）
* Add Advanced Parameters：disk.EnableUUID / TRUE
* 上傳Discovery ISO至DataStore，並使用其開機
* 於bastion上測試連線
    
    ```bash
    [root@bastion ~]# ssh -i ~/.ssh/id_rsa core@192.168.0.232
    The authenticity of host '192.168.130.212 (192.168.130.212)' can't be established.
    ED25519 key fingerprint is SHA256:73WJlp2ZM8LInYlt2WIrYhtVOgJNJCBr3uzcQyEfM5E.
    This key is not known by any other names
    Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
    Warning: Permanently added '192.168.130.212' (ED25519) to the list of known hosts.
    
    **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  ** **  **  **  **  **  **  **
    This is a host being installed by the OpenShift Assisted Installer.
    It will be installed from scratch during the installation.
    
    The primary service is agent.service. To watch its status, run:
    sudo journalctl -u agent.service
    
    To view the agent log, run:
    sudo journalctl TAG=agent
    **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  ** **  **  **  **  **  **  **
    [systemd]
    Failed Units: 1
      rpm-ostree-fix-shadow-mode.service
    [core@master-1 ~]$
    ```
    
* 查看Hybrid Cloud Console是否有建立  
* Install Cluster（非常耗時，約莫一小時多）
* 紀錄帳密：kubeadmin / gTDvp-xhVT2-S9Doo-FInKU
* 從bastion測試登入Master，之後直接從bastion控制

```bash
ssh -i ~/.ssh/id_rsa core@172.12.25.42
oc login api.ocp.andy.com:6443 -u kubeadmin -p uEM2N-UEwo4-GZuCR-5cQfs
```
    
* 傳送檔案指令：
```bash
scp ~/rhel-baseos-9.1-x86_64-dvd.iso core@172.12.25.42:~/rhel-baseos-9.1-x86_64-dvd.iso
```
