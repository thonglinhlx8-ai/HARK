# ep56: xếp lời thoại lên trục thời gian; 2 cú hit rơi đúng vạch ô nhịp (90 BPM) ngay sau cụm lời trước nó
import json,math,re
m=json.load(open('public/audio/ep56-mo-neo/vo/meta.json')); cues=json.load(open('src/episodes/ep56-mo-neo/cues.json'))
BAR=4*60/90; T0=0.3; bar=lambda k:T0+BAR*k
H1,H2=6,18   # chỉ số câu đầu tiên sau mỗi hit
GAP={1:1.0,3:0.15,4:0.45,7:0.45,8:0.4,14:0.25}
t=0.4; out=[]; hits=[]
for i,x in enumerate(m):
    if i in (H1,H2) and i==H2+0: pass
    if i==10 or i==18:
        k=math.ceil((t+0.35-T0)/BAR); hits.append(k); t=bar(k)+2.3
    sp=x['words'][-1][1]+0.08
    # thời gian từng ký tự của phụ đề
    disp=re.sub(r'[【】]','',cues[i]); toks=disp.split(' '); ws=[w[0] for w in x['words']]; times=[]; wi=0; last=0.1
    for j,tok in enumerate(toks):
        if tok in ('–','—'): tt=last
        else: tt=ws[wi] if wi<len(ws) else last; wi+=1
        last=tt; times+= [round(tt,3)]*len(tok)+([round(tt,3)] if j<len(toks)-1 else [])
    assert len(times)==len(disp),(i,len(times),len(disp))
    out.append({'start':round(t,3),'end':round(t+sp,3),'times':times})
    t+=sp+GAP.get(i+1,0.35)
bars=math.ceil((t+2.5-T0)/BAR)
json.dump(out,open('src/episodes/ep56-mo-neo/vo.json','w'),ensure_ascii=False)
json.dump({'hit1':hits[0],'hit2':hits[1],'bars':bars},open('src/episodes/ep56-mo-neo/layout.json','w'))
print(hits,bars,round(bar(bars)+1,1)); [print(i,o['start'],o['end']) for i,o in enumerate(out)]
