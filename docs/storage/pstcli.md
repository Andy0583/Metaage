## Ubuntu 離線安裝
```shell
# 在可上網Ubuntu上執行
apt install alien

alien -d pstcli-4.3.0.0.1661.x86_64.release.rpm

# 在目標主機上執行（檔案＊.deb 放到/tmp）
ip route del default

root@openclaw:~# dpkg -l libc6 libcrypt1 libgcc-s1 libstdc++6  #確認相依性套件
Desired=Unknown/Install/Remove/Purge/Hold
| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend
|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)
||/ Name             Version                 Architecture Description
+++-================-=======================-============-=================================
ii  libc6:amd64      2.39-0ubuntu8.7         amd64        GNU C Library: Shared libraries
ii  libcrypt1:amd64  1:4.4.36-4build1        amd64        libcrypt shared library
ii  libgcc-s1:amd64  14.2.0-4ubuntu2~24.04.1 amd64        GCC support library
ii  libstdc++6:amd64 14.2.0-4ubuntu2~24.04.1 amd64        GNU Standard C++ Library v3

chmod +x ./pstcli_4.3.0.0.1661-2_amd64.deb

apt install /tmp/pstcli_4.3.0.0.1661-2_amd64.deb

pstcli
```
