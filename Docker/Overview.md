## Container介紹

### 時間校時
```
nano /etc/chrony/chrony.conf
======================
# 註解掉
#pool 2.debian.pool.ntp.org iburst
# 增加
server 172.22.46.250 iburst
======================
systemctl enable chrony --now
systemctl restart chronyd
chronyc -a makestep
date
```
