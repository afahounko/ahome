# AWX-RPM

[![Build Status](https://travis-ci.org/subuk/awx-rpm.svg?branch=master)](https://travis-ci.org/subuk/awx-rpm)

Fat RPMs for ansible-awx project.

Tested distributions:
- Amazon linux 2017.3
- Centos 7

## How to build RPM

- Grab source archive and put it in the repository root (see below how to do it)
- Change version in awx.spec
- Run your favorite rpm build process or use bundled scripts (build with docker): `./build.sh [amazonlinux-2017.03|centos-7]`

## How to build source archive

    git clone git@github.com:ansible/awx.git
    cd awx
    git clone git@github.com:ansible/awx-logos.git

    docker run -v `pwd`:/awx --rm -i centos:7 /bin/bash <<EOF
    yum install -y epel-release && yum install -y bzip2 gcc-c++ git gettext make python-pip
    curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
    yum install -y nodejs
    cd /awx/
    make sdist
    EOF

## Installation

Install awx rpm package

    yum install ./awx-XXX.x86_64.rpm

Install rabbitmq and postgresql96 server (example for centos7)

    yum install -y epel-release
    yum install -y https://download.postgresql.org/pub/repos/yum/9.6/redhat/rhel-7-x86_64/pgdg-centos96-9.6-3.noarch.rpm
    yum install -y rabbitmq-server postgresql96-server
    /usr/pgsql-9.6/bin/postgresql96-setup initdb
    systemctl enable rabbitmq-server
    systemctl start rabbitmq-server
    systemctl enable postgresql-9.6
    systemctl start postgresql-9.6

Create postgresql database and user for awx

    sudo -u postgres createuser -S awx
    sudo -u postgres createdb -O awx awx

Run sql migrations (takes a few minutes)

    sudo -u awx /opt/awx/bin/awx-manage migrate

Initialize application

    echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'root@localhost', 'password')" | sudo -u awx /opt/awx/bin/awx-manage shell
    sudo -u awx /opt/awx/bin/awx-manage create_preload_data
    sudo -u awx /opt/awx/bin/awx-manage provision_instance --hostname=$(hostname)
    sudo -u awx /opt/awx/bin/awx-manage register_queue --queuename=tower --hostnames=$(hostname)

Configure nginx, use this example from awx repository

    https://github.com/ansible/awx/blob/devel/installer/image_build/files/nginx.conf

Start and enable services (again, example for centos7)

    systemctl start awx-cbreceiver
    systemctl start awx-celery-beat
    systemctl start awx-celery-worker
    systemctl start awx-channels-worker
    systemctl start awx-daphne
    systemctl start awx-web

    systemctl enable awx-cbreceiver
    systemctl enable awx-celery-beat
    systemctl enable awx-celery-worker
    systemctl enable awx-channels-worker
    systemctl enable awx-daphne
    systemctl enable awx-web


## External postgresql database

The configuration is in /etc/awx/settings.py..

more specific:

    DATABASES = {
        'default': {
            'ATOMIC_REQUESTS': True,
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'awx',
            'USER': 'DATABASE_USER',
            'PASSWORD': 'DATABASE_PASSWORD',
            'HOST': 'DATABASE_HOST',
            'PORT': 'DATABASE_PORT',
        }
    }


Run sql migrations (takes a few minutes)

    sudo -u awx /opt/awx/bin/awx-manage migrate


## Git repository | https://gogs.io/

### RHEL/CentOS

```
$ sudo yum update
$ sudo yum install git
```

Download binary from https://gogs.io/docs/installation/install_from_binary

     Check that prerequisites are installed
     Extract the archive.
     cd into the directory that was just created.
     Execute ./gogs web.

https://github.com/gogs/gogs/tree/master/scripts

Running as daemon via systemd

Create a file named /etc/systemd/system/gogs.service as follows, assuming gogs is installed in the /home/git user:

```
[Unit]
Description=Gogs
After=syslog.target
After=network.target
After=mariadb.service mysqld.service postgresql.service memcached.service redis.service

[Service]
# Modify these two values and uncomment them if you have
# repos with lots of files and get an HTTP error 500 because
# of that
###
#LimitMEMLOCK=infinity
#LimitNOFILE=65535
Type=simple
User=git
Group=git
WorkingDirectory=/home/git/gogs
ExecStart=/home/git/gogs/gogs web
Restart=always
Environment=USER=git HOME=/home/git

# Some distributions may not support these hardening directives. If you cannot start the service due
# to an unknown option, comment out the ones not supported by your version of systemd.
ProtectSystem=full
PrivateDevices=yes
PrivateTmp=yes
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```
    