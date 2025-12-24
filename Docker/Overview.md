## Container介紹
* 容器（Container）：運行在Image上的應用程式，如 Web Service、Dell SCG、網路銀行APP...等。<br>

|優點|缺點|
|---|---|
|因運行在Image上，無須作業系統，資源利用率高、容量需求小、啟動極快|每個應用程式，需一個容器或數十個容器組成，管理較為不易|
|無須擔心系統故障，只需在相同Image上，重啟另一個容器即可|共用宿主主機及Image，若有漏洞則容易造成安全上隱憂|
|搭配K8S或OCP等管理工具，極易擴展、縮減、HA|網路與傳統網路不同，如Service、Ingress..等，學習曲線較高|

### Container VS VMWare
![](./image/001.png)
