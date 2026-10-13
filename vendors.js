// Local lookup only. These are community compilations, not Apple certifications or quality grades.
export const codeRules=[
 {component:'screen',prefixes:['G9N','G9P','G9Q'],vendor:'三星显示 Samsung Display',id:'panel-samsung-g9',source:'https://wker.com/iphone-samsung/'},
 {component:'screen',prefixes:['GH3','GVC'],vendor:'LG Display',id:'panel-lg',source:'https://wker.com/iphone-samsung/'},
 {component:'screen',prefixes:['J5V'],vendor:'京东方 BOE',id:'panel-boe-j5v',source:'https://wker.com/iphone-samsung/'},
 {component:'screen',prefixes:['B02','B03'],vendor:'京东方 BOE',id:'panel-boe-b0',source:'https://www.pconline.com.cn/ask/121778.html'},
 {component:'battery',prefixes:['F5D'],vendor:'惠州德赛 Desay',id:'battery-desay-f5d',source:'https://zhidao.baidu.com/question/994630251263129779.html'},
 {component:'battery',prefixes:['F8Y'],vendor:'欣旺达 Sunwoda',id:'battery-sunwoda-f8y',source:'https://zhidao.baidu.com/question/994630251263129779.html'},
 {component:'battery',prefixes:['FG9','F9Y'],vendor:'新普科技 Simplo',id:'battery-simplo',source:'https://zhidao.baidu.com/question/994630251263129779.html'}
];
export const nameRules=[
 {test:/^(sk\s*)?hynix$/i,vendor:'海力士 SK hynix'},
 {test:/^samsung(\s+electronics)?$/i,vendor:'三星 Samsung'},
 {test:/^sunwoda$/i,vendor:'欣旺达 Sunwoda'},
 {test:/^desay$/i,vendor:'惠州德赛 Desay'},
 {test:/^cowell$/i,vendor:'高伟电子 Cowell'},
 {test:/^(foxconn|hon\s*hai)$/i,vendor:'富士康 Foxconn'},
 {test:/^lg(\s+display|\s+innotek)?$/i,vendor:'LG'},
 {test:/^(kioxia|toshiba)$/i,vendor:'铠侠 Kioxia'},
 {test:/^sandisk$/i,vendor:'闪迪 SanDisk'},
 {test:/^micron$/i,vendor:'美光 Micron'},
 {test:/^(boe|京东方)$/i,vendor:'京东方 BOE'},
 {test:/^(simplo|新普科技)$/i,vendor:'新普科技 Simplo'}
];
