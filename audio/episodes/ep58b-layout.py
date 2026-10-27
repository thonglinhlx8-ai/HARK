# ep58b Sư tử — giữ nguyên nội dung ep58, canh lại theo bài 0908 (128 BPM, phách 0 = 0,41 s, ô = 1,875 s).
# Neo: câu 3 "lo âu" = ô 8 (drop 1, 15,41) · câu 13 "91,4%" = ô 29 · câu 15 "chạy" = ô 32 (build, 60,41)
#      câu 19 = ô 40 (drop 2, 75,41) · câu cuối vào ô 52, hết ô 56 (105,41).
import json,re
E='src/episodes/ep58b-su-tu'
cues=json.load(open(f'{E}/cues.json'))
B=json.load(open(f'{E}/beats.orig.json')); json.dump(B,open(f'{E}/beats.json','w'))
json.dump(json.load(open(f'{E}/bass.orig.json')),open(f'{E}/bass.json','w'))
bar=lambda k:B[4*k]
snap=lambda t:min(B,key=lambda b:abs(b-t))
WSTEP,READ,HOLD,MIN=0.13,0.19,0.5,1.9
ANCH=[(3,'lo âu',8),(13,'91,4%',29),(15,'chạy',32),(19,None,40)]
def toks(i):
    disp=re.sub(r'[【】]','',cues[i]); ws=disp.split(' ')
    times=[]
    for j,tok in enumerate(ws): times+=[round(j*WSTEP,3)]*len(tok)+([round(j*WSTEP,3)] if j<len(ws)-1 else [])
    assert len(times)==len(disp)
    return disp,ws,times
dur=[max(MIN,len(toks(i)[1])*READ+HOLD) for i in range(len(cues))]
starts=[0.0]*len(cues)
def place(a,b,t0,t1):
    if b<=a: print(f'đoạn trống {a}, khe {t1-t0:.2f}'); return
    need=sum(dur[a:b]); k=(t1-t0)/need; t=t0
    for i in range(a,b): starts[i]=t; t+=dur[i]*k
    for i in range(a+1,b): starts[i]=snap(starts[i])
    print(f'đoạn {a}-{b-1}: hệ số {k:.2f}')
t0=0.0; a=0
for i,w,k in ANCH:
    disp,ws,times=toks(i); off=times[disp.lower().index(w.lower())] if w else 0
    s=bar(k)-off
    place(a,i,t0,s); starts[i]=s
    t0=s+dur[i]; a=i+1
place(a,len(cues)-1,t0,bar(52)); starts[-1]=bar(52)
out=[]
for i in range(len(cues)):
    nxt=starts[i+1] if i+1<len(cues) else starts[i]+dur[i]+2.5
    out.append({'start':round(starts[i],3),'end':round(min(nxt-0.35,starts[i]+dur[i]+1.2)-1.2,3),'times':toks(i)[2]})
bars=56
json.dump(out,open(f'{E}/vo.json','w'),ensure_ascii=False)
json.dump({'end':round(bar(bars)+0.2,2),'bars':bars,'hits':[k for _,_,k in ANCH],'splice':None},open(f'{E}/layout.json','w'))
print('end',round(bar(bars)+0.2,2))
for i,o in enumerate(out): print(i,o['start'],round(o['end']+1.2-o['start'],1),round(dur[i],1),cues[i][:40])
