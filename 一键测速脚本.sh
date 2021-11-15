大家新买了VPS，免不了需要测试一下新VPS的性能，以前测试比较繁琐，显示结果也不直观。今天发现秋大新的一键测试脚本bench.sh，特别转发过来。

经过几个版本的演化，一键测试脚本 bench.sh 已经几乎全面适用于各种 Linux 发行版的网络（下行）和 IO 测试。
并将测试结果以较为美观的方式显示出来。

总结一下 bench.sh 特点：
1、显示当前测试的各种系统信息；
2、取自世界多处的知名数据中心的测试点，下载测试比较全面；
3、支持 IPv6 下载测速；
4、IO 测试三次，并显示平均值。

再配合 unixbench.sh 脚本测试，即可全面测试 VPS 的性能。

使用方法：
命令1：
wget -qO- bench.sh | bash
或者
curl -Lso- bench.sh | bash

命令2：
wget -qO- 86.re/bench.sh | bash
或者
curl -so- 86.re/bench.sh | bash
