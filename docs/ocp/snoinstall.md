### **<font color="red">Bastion 前置作業</font>**
**指定ISO為repo**
```
mkdir /var/repo
mount -o loop rhel-baseos-9.1-x86_64-dvd.iso /var/repo/

cat > /etc/yum.repos.d/rhel9-local.repo << EOF
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
EOF

yum clean all
subscription-manager clean
sed -i 's/enabled=1/enabled=0/' /etc/yum/pluginconf.d/subscription-manager.conf
```

**關閉防火牆**
```
systemctl stop firewalld
systemctl disable firewalld
setenforce 0
sed -i 's/enforcing/disabled/' /etc/selinux/config
```
### **<font color="red">Infra 安裝</font>**
**安裝相關tool**
```
mkdir -p /home/ocp-offline
tar xvf ocp-offline-bundle.tar -C /home/ocp-offline
cd /home/ocp-offline/tools
tar xzf openshift-install-linux.tar.gz
tar xzf openshift-client-linux.tar.gz
tar xzf oc-mirror.tar.gz
chmod +x oc-mirror openshift-install oc kubectl
mv oc-mirror openshift-install oc kubectl /usr/local/bin/
```

**安裝NTP Server**
```
rm /etc/chrony.conf

vi /etc/chrony.conf

driftfile /var/lib/chrony/drift
allow 172.22.46.0/24
local stratum 10
makestep 1.0 3
rtcsync
logdir /var/log/chrony

systemctl start chronyd
systemctl enable chronyd
timedatectl set-ntp no
timedatectl set-time "00:10:00"
```

**安裝DNS Server**
```
mkdir -p /opt/bind-offline
tar xzvf bind-offline.tar.gz -C /opt/bind-offline
cd /opt/bind-offline
dnf localinstall *.rpm
```
```
vi /etc/named.conf

        listen-on port 53 { any; };
#       listen-on-v6 port 53 { ::1; };
        allow-query     { any; };
        dnssec-enable no;
        dnssec-validation no;
zone "ocp.andy.com" IN {
        type master;
        file "named.ocp.andy.com";
};

zone "46.22.172.in-addr.arpa" IN {
        type master;
        file "rev.46.22.172";
};
```
```
vi /var/named/named.ocp.andy.com

$TTL 1D
@       IN SOA  @ bastion.ocp.andy.com. (
                                        2020040819      ; serial
                                        3H      ; refresh
                                        15M     ; retry
                                        1W      ; expire
                                        1D )    ; minimum
@       IN NS   bastion.ocp.andy.com.
@       IN A    172.22.46.200

bastion                 IN      A       172.22.46.200
harbor                  IN      A       172.22.46.209
sno                     IN      A       172.22.46.201
api                     IN      A       172.22.46.201
api-int                 IN      A       172.22.46.201
*.apps                  IN      A       172.22.46.201
```
```
vi /var/named/rev.46.22.172

$TTL 1D
@       IN SOA  @ bastion.ocp.andy.com. (
                                        2020040819      ; serial
                                        1D      ; refresh
                                        1H      ; retry
                                        1W      ; expire
                                        3H )    ; minimum
@       IN NS   bastion.ocp.andy.com.

46.22.172.in-addr.arpa      IN      PTR     bastion.ocp.andy.com
200   IN      PTR     bastion.ocp.andy.com.
209   IN      PTR     harbor.ocp.andy.com.
201   IN      PTR     sno.ocp.andy.com.
```
```
chgrp named /var/named/named.ocp.andy.com
chmod 640 /var/named/named.ocp.andy.com
chgrp named /var/named/rev.46.22.172
chmod 640 /var/named/rev.46.22.172
systemctl enable named
systemctl start named
```

**安裝nmstate-rpms**
```
cd nmstate-rpms/
rpm -Uvh *.rpm
```
