```
sudo passwd root
sudo ufw disable
sudo vi /etc/ssh/sshd_config
```
> ```
> PermitRootLogin yes
> ```
```
sudo systemctl restart ssh
```

``` 
curl -fsSL https://get.docker.com | sh

systemctl start docker && systemctl enable docker

cat > /etc/docker/daemon.json << EOF
{
  "insecure-registries": ["172.12.25.51:5000"]
}
EOF

systemctl restart docker

docker run -d -p 5000:5000 --name myhub registry:2
```
