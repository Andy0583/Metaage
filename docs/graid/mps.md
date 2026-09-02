## Script deployment of MPS
---
[檔案下載](https://dtimis-my.sharepoint.com/:u:/g/personal/andyhsu_ginnet_com_tw/IQDzNICZILQvQZPL0Il34MFFATP8syauTa9dDjS86C4PGJs?e=HBJCw2)

**Check**
```
python3 graid_mps_setup.py --check
```

**Configure MPS**
```
python3 graid_mps_setup.py
```

**Teardown MPS**
```
python3 graid_mps_setup.py --teardown
```

## Manual deployment of MPS
---
**建立目錄與設定運算模式**
```
mkdir -p /tmp/nvidia-mps /tmp/nvidia-log
chmod 1777 /tmp/nvidia-mps /tmp/nvidia-log
nvidia-smi -c EXCLUSIVE_PROCESS
```

**建立 nvidia-mps.service**
```
cat > /etc/systemd/system/nvidia-mps.service << 'EOF'
[Unit]
Description=NVIDIA CUDA MPS Control Daemon
DefaultDependencies=no
After=nvidia-persistenced.service
Before=graid.service

[Service]
Type=forking
ExecStartPre=/bin/mkdir -p /tmp/nvidia-mps /tmp/nvidia-log
ExecStart=/bin/sh -c 'nvidia-cuda-mps-control -d'
ExecStop=/bin/sh -c 'echo quit | nvidia-cuda-mps-control'
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
```

**設定 MPS 服務的環境變數**
```
mkdir -p /etc/systemd/system/nvidia-mps.service.d
cat > /etc/systemd/system/nvidia-mps.service.d/override.conf << 'EOF'
[Service]
Environment="CUDA_MPS_PIPE_DIRECTORY=/tmp/nvidia-mps"
Environment="CUDA_MPS_LOG_DIRECTORY=/tmp/nvidia-log"
EOF
```

**設定 GRAID 服務的環境變數**
```
mkdir -p /etc/systemd/system/graid.service.d
cat > /etc/systemd/system/graid.service.d/mps.conf << 'EOF'
[Service]
Environment="CUDA_MPS_PIPE_DIRECTORY=/tmp/nvidia-mps"
Environment="CUDA_MPS_LOG_DIRECTORY=/tmp/nvidia-log"
EOF

mkdir -p /etc/systemd/system/graidcore@.service.d
cat > /etc/systemd/system/graidcore@.service.d/mps.conf << 'EOF'
[Service]
Environment="CUDA_MPS_PIPE_DIRECTORY=/tmp/nvidia-mps"
Environment="CUDA_MPS_LOG_DIRECTORY=/tmp/nvidia-log"
EOF
```

**套用設定並重啟服務**
```
systemctl daemon-reload
systemctl enable --now nvidia-mps.service
systemctl restart graid.service
systemctl restart 'graidcore@*.service'
```
**驗證**
```
systemctl is-active nvidia-mps.service && echo get_server_list | nvidia-cuda-mps-control && echo "MPS OK"
```
