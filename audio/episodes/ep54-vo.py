# ep54 lồng tiếng: Edge TTS vi-VN-NamMinhNeural, rate +6%; ghi vo/NN.mp3 + vo/meta.json (thời lượng, word boundaries)
import re,asyncio,edge_tts,subprocess,json,sys
src=open('src/episodes/ep54-song-sot/timeline.ts').read()
cues=re.findall(r"\[([\d.]+), '(.*?)'\],",src)
D='public/audio/ep54-song-sot/vo'
def clean(t): return re.sub(r'[【】"]','',t).replace(' —',',').replace('—','').strip()
async def one(i,t):
    p=f'{D}/{i:02d}.mp3'; words=[]
    c=edge_tts.Communicate(clean(t),'vi-VN-NamMinhNeural',rate='+6%',boundary='WordBoundary')
    with open(p,'wb') as fh:
        async for m in c.stream():
            if m['type']=='audio': fh.write(m['data'])
            elif m['type']=='WordBoundary': words.append([m['offset']/1e7,(m['offset']+m['duration'])/1e7,m['text']])
    d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
    return {'i':i,'bar':float(cues[i][0]),'dur':d,'words':words,'text':clean(t)}
async def go(): return [await one(i,t) for i,(b,t) in enumerate(cues)]
r=asyncio.run(go()); json.dump(r,open(f'{D}/meta.json','w'),ensure_ascii=False,indent=1)
B=4*60/90
for k,x in enumerate(r):
    nb=r[k+1]['bar'] if k+1<len(r) else 31
    sp=x['words'][-1][1] if x['words'] else x['dur']
    print(x['i'],x['bar'],round(sp,2),round((nb-x['bar'])*B,2),'OVER' if sp>(nb-x['bar'])*B-0.2 else '',x['text'])
