#!/bin/bash
set -e
mkdir -p /tmp/awx-rpmbuild-cache

BUILD_SCRIPT=`pwd`/ahome-rpm/buildhelpers/build.sh
AHOME_TAR_GZ=awx-2.1.0.tar.gz
AHOME_PATH=`pwd`/dist/$AHOME_TAR_GZ

case "$1" in
    "amazonlinux-2017.03")
        DOCKER_IMAGE=ctbuild/amazonlinux:2017.03
        YUM_CONFIG=`pwd`/ahome-rpm/buildhelpers/amazonlinux2017.03.yum.conf
    ;;
    "centos-7")
        DOCKER_IMAGE=ctbuild/centos:7
        YUM_CONFIG=`pwd`/ahome-rpm/buildhelpers/centos7.yum.conf
    ;;
    *)
        echo "Usage: $0 [centos-7|amazonlinux-2017.03]"
        exit 1
esac

exec docker run --rm -i \
    -v `pwd`/ahome-rpm:/source \
    -v $AHOME_PATH:/source/$AHOME_TAR_GZ \
    -v `pwd`/ahome-rpm/result:/result \
    -v /tmp/awx-rpmbuild-cache:/cache \
    -v $YUM_CONFIG:/etc/yum.conf \
    -v $BUILD_SCRIPT:/build.sh \
    $DOCKER_IMAGE /build.sh awx-build.spec
