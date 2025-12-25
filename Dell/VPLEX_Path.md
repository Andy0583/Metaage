## VPLEX Reset
### 斷開Cluster
* Storage View要砍掉
* 若為Metro架構，需於Cluster 2先斷開Cluster 1 director
```
VPlexcli:/> disconnect -n director-1-1-A
VPlexcli:/> disconnect -n director-1-1-B
```
