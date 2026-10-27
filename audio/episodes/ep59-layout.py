# ep59 Tấm lưới (không lời dẫn): chữ + nhạc user gửi (cùng bài với ep58, ~112 BPM).
# Câu đặt lên phách thật (beats.orig.json). Hai câu neo rơi đúng drop của nhạc:
#   câu 7 chữ "vẫn chưa cưới" = ô 8 (drop 1, ~17,5 s); câu 24 chữ "chưa hề đứt" = ô 44 (drop 2, ~93,9 s).
# Mỗi đoạn giữa hai neo: thời lượng câu theo tốc độ đọc rồi co / giãn đều cho vừa, đầu câu bám phách gần nhất.
import json,re
E='src/episodes/ep59-tam-luoi'
cues=json.load(open(f'{E}/cues.json'))
B=json.load(open(f'{E}/beats.orig.json')); json.dump(B,open(f'{E}/beats.json','w'))
json.dump(json.load(open(f'{E}/bass.orig.json')),open(f'{E}/bass.json','w'))
bar=lambda k:B[4*k]
snap=lambda t:min(B,key=lambda b:abs(b-t))
WSTEP,READ,HOLD,MIN=0.13,0.2,0.7,2.0
ANCH=[(7,'vẫn chưa cưới',8),(24,'chưa hề đứt',44)]
def toks(i):
    disp=re.sub(r'[【】]','',cues[i]); ws=disp.split(' ')
    times=[]
    for j,tok in enumerate(ws): times+=[round(j*WSTEP,3)]*len(tok)+([round(j*WSTEP,3)] if j<len(ws)-1 else [])
    assert len(times)==len(disp)
    return disp,ws,times
dur=[max(MIN,len(toks(i)[1])*READ+HOLD) for i in range(len(cues))]
starts=[0.0]*len(cues)
def place(a,b,t0,t1):
    # câu a..b-1 lấp khoảng [t0,t1) (t1 = lúc câu b bắt đầu)
    need=sum(dur[a:b]); k=(t1-t0)/need
    t=t0
    for i in range(a,b):
        starts[i]=t; t+=dur[i]*k
    for i in range(a+1,b): starts[i]=snap(starts[i])
    print(f'đoạn {a}-{b-1}: hệ số {k:.2f}')
t0=B[2]; a=0
for i,w,k in ANCH:
    disp,ws,times=toks(i); off=times[disp.lower().index(w)]
    s=bar(k)-off
    place(a,i,t0,s); starts[i]=s
    t0=s+dur[i]; a=i+1
# đoạn cuối: tự nhiên, câu cuối giữ lâu
t=t0
for i in range(a,len(cues)):
    starts[i]=snap(t) if i>a else t; t=starts[i]+dur[i]+0.15
out=[]
for i in range(len(cues)):
    nxt=starts[i+1] if i+1<len(cues) else starts[i]+dur[i]+2.5
    out.append({'start':round(starts[i],3),'end':round(min(nxt-0.35,starts[i]+dur[i]+1.2)-1.2,3),'times':toks(i)[2]})
end=starts[-1]+dur[-1]+3.5
bars=min(k for k in range(len(B)//4) if bar(k)>=end)
json.dump(out,open(f'{E}/vo.json','w'),ensure_ascii=False)
json.dump({'end':round(bar(bars)+0.5,2),'bars':bars,'hits':[k for _,_,k in ANCH],'splice':None},open(f'{E}/layout.json','w'))
print('end',round(bar(bars)+0.5,1))
for i,o in enumerate(out): print(i,o['start'],round(o['end']+1.2-o['start'],1),cues[i][:40])
