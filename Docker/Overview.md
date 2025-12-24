## Container介紹
* 容器（Container）：運行在Image上的應用程式，如 Web Service、Dell SCG、網路銀行APP...等。
| 優點 | 缺點 |
| --- | --- |
| 因運行在Image上，無須作業系統，資源利用率高、容量需求小、啟動極快 | 每個應用程式，皆需一個容器或數十個容器組成，管理上較為不易 |
| 無須擔心系統故障，只需在相同Image上，重啟另一個容器即可 | 共用宿主主機及Image，若有漏洞則容易造成安全上隱憂|
| 搭配K8S或OCP等管理工具，極易擴展、縮減、HA | 網路設定與傳統網路架構不同，如Service、Ingress...等，學習曲線較高 |

### Container VS VMWare



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
