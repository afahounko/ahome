[![Run Status](https://api.shippable.com/projects/591c82a22f895107009e8b35/badge?branch=devel)](https://app.shippable.com/github/ansible/awx)

AHOME
===

AHOME, Cloud as a Service, provides an intuitive web interface, which is a hassle-free tool able to
document a complete private and public infrastructure and automate from scratch the provisioning of
cloud solutions. The equipment to be provisioned can be physical or virtual and they can be located in
private or public Cloud infrastructure.
ahomé intuitively guides you through an automated step by step process as you document your
infrastructure.
And let ahomé do the rest.
1. Document your infrastructure (organization, location, ip addresses, vlans, domains and
gateways)
2. Identify your physical equipment (network appliances, storage devices and physical
machines)
3. Specify your type of cloud infrastructure provider (Red Hat Enterprise Virtualization, Red Hat
OpenShift Container Platform, KVM, Red Hat OpenStack, Amazon, Azure, Google EC)
4. Specify your storage infrastructure (local, NFS, FIC, GlusterFS, CEPH)
5. Define what kind of services you want to install (Red Hat products, Container applications)
6. Ask ahomé to deploy and maintain your hybrid infrastructure
Repeat and redo as many times…


AHOME uses AWX as engine.

AWX
----
AWX provides a web-based user interface, REST API, and task engine built on top of [Ansible](https://github.com/ansible/ansible). It is the upstream project for [Tower](https://www.ansible.com/tower), a commercial derivative of AWX.  

To install AWX, please view the [Install guide](./INSTALL.md).

To learn more about using AWX, and Tower, view the [Tower docs site](http://docs.ansible.com/ansible-tower/index.html).

The AWX Project Frequently Asked Questions can be found [here](https://www.ansible.com/awx-project-faq).

Contributing
------------

- Refer to the [Contributing guide](./CONTRIBUTING.md) to get started developing, testing, and building AWX.
- All code submissions are done through pull requests against the `devel` branch.
- All contributors must use git commit --signoff for any commit to be merged, and agree that usage of --signoff constitutes agreement with the terms of [DCO 1.1](./DCO_1_1.md)
- Take care to make sure no merge commits are in the submission, and use `git rebase` vs `git merge` for this reason.
- If submitting a large code change, it's a good idea to join the `#ansible-awx` channel on irc.freenode.net, and talk about what you would like to do or add first. This not only helps everyone know what's going on, it also helps save time and effort, if the community decides some changes are needed.

Reporting Issues
----------------

If you're experiencing a problem that you feel is a bug in AWX, or have ideas for how to improve AWX, we encourage you to open an issue, and share your feedback. But before opening a new issue, we ask that you please take a look at our [Issues guide](./ISSUES.md).

Code of Conduct
---------------

We ask all of our community members and contributors to adhere to the [Ansible code of conduct](http://docs.ansible.com/ansible/latest/community/code_of_conduct.html). If you have questions, or need assistance, please reach out to our community team at [codeofconduct@ansible.com](mailto:codeofconduct@ansible.com)   

Get Involved
------------

We welcome your feedback and ideas. Here's how to reach us with feedback and questions:

- Join the `#ansible-awx` channel on irc.freenode.net
- Join the [mailing list](https://groups.google.com/forum/#!forum/awx-project) 

License
-------

[Apache v2](./LICENSE.md)

