--// B13 CORINGA FFH4X | VERSÃO COMPLETA v2.0
--// Discord: discord.gg/tDsNEjWT4j

--// SERVIÇOS
local Players         = game:GetService("Players")
local RunService      = game:GetService("RunService")
local Lighting        = game:GetService("Lighting")
local UserInputService= game:GetService("UserInputService")
local Camera          = workspace.CurrentCamera
local LP              = Players.LocalPlayer

--// VARIÁVEIS
local SpeedValue    = 16
local JumpValue     = 50
local AutoJump      = false
local InfJump       = false
local Spinbot       = false
local SpinSpeed     = 25
local Fly           = false
local FlySpeed      = 80
local NoClip        = false
local GodMode       = false

local Aimbot        = false
local AimFOV        = 120
local AimSmoothness = 0.15
local AimPart       = "Head"
local NoRecoil      = false
local ShowFOV       = false
local RGBFov        = false

local ESPEnabled    = false
local ESPColor      = Color3.fromRGB(255,0,0)
local BoxESP        = false
local BoxColor      = Color3.fromRGB(0,255,0)
local RGBBox        = false
local SkeletonESP   = false
local SkeletonColor = Color3.fromRGB(255,255,0)
local RGBSkeleton   = false
local LineESP       = false
local RGBLine       = false
local LineColor     = Color3.fromRGB(0,255,0)
local DistESP       = false
local NameESP       = false
local HealthESP     = false

--// TABELAS
local Highlights  = {}
local LineDraws   = {}
local BoxDraws    = {}
local SkelDraws   = {}
local DistLabels  = {}
local NameLabels  = {}
local HealthBars  = {}
local HealthBarsB = {}

--// FLY
local BV, BG

--// AUXILIARES
local function GetChar()  return LP.Character or LP.CharacterAdded:Wait() end
local function GetHum()   local c=GetChar(); return c and c:FindFirstChildOfClass("Humanoid") end
local function GetRoot()  local c=GetChar(); return c and c:FindFirstChild("HumanoidRootPart") end

--// DETECÇÃO R6/R15 — retorna lista de ossos
local function GetBones(Char)
    if Char:FindFirstChild("UpperTorso") then
        -- R15
        return {
            {"Head","UpperTorso"},
            {"UpperTorso","LowerTorso"},
            {"LowerTorso","LeftUpperLeg"},
            {"LowerTorso","RightUpperLeg"},
            {"LeftUpperLeg","LeftLowerLeg"},
            {"RightUpperLeg","RightLowerLeg"},
            {"LeftLowerLeg","LeftFoot"},
            {"RightLowerLeg","RightFoot"},
            {"UpperTorso","LeftUpperArm"},
            {"UpperTorso","RightUpperArm"},
            {"LeftUpperArm","LeftLowerArm"},
            {"RightUpperArm","RightLowerArm"},
            {"LeftLowerArm","LeftHand"},
            {"RightLowerArm","RightHand"},
        }
    else
        -- R6
        return {
            {"Head","Torso"},
            {"Torso","Left Arm"},
            {"Torso","Right Arm"},
            {"Torso","Left Leg"},
            {"Torso","Right Leg"},
        }
    end
end

--// ANTI AFK
LP.Idled:Connect(function()
    local VU = game:GetService("VirtualUser")
    VU:Button2Down(Vector2.new(0,0), Camera.CFrame)
    task.wait(1)
    VU:Button2Up(Vector2.new(0,0), Camera.CFrame)
end)

--// ANTI KICK
local mt = getrawmetatable(game)
local old_nc = mt.__namecall
setreadonly(mt, false)
mt.__namecall = newcclosure(function(self, ...)
    local method = getnamecallmethod()
    if method == "Kick" and self == LP then return end
    return old_nc(self, ...)
end)
setreadonly(mt, true)

--// CRIAR/LIMPAR ESP
local function LimparESP(Player)
    if Highlights[Player]  then Highlights[Player]:Destroy() end
    if LineDraws[Player]   then LineDraws[Player]:Remove()   end
    if BoxDraws[Player]    then for _,l in pairs(BoxDraws[Player])  do l:Remove() end end
    if SkelDraws[Player]   then for _,s in pairs(SkelDraws[Player]) do s.line:Remove() end end
    if DistLabels[Player]  then DistLabels[Player]:Remove()  end
    if NameLabels[Player]  then NameLabels[Player]:Remove()  end
    if HealthBars[Player]  then HealthBars[Player]:Remove()  end
    if HealthBarsB[Player] then HealthBarsB[Player]:Remove() end
    Highlights[Player]=nil; LineDraws[Player]=nil
    BoxDraws[Player]=nil;   SkelDraws[Player]=nil
    DistLabels[Player]=nil; NameLabels[Player]=nil
    HealthBars[Player]=nil; HealthBarsB[Player]=nil
end

local function CriarESP(Player)
    if Player == LP then return end
    local function Load(Char)
        LimparESP(Player)
        -- Highlight
        local H = Instance.new("Highlight")
        H.Name="B13ESP"; H.FillColor=ESPColor; H.OutlineColor=Color3.new(1,1,1)
        H.FillTransparency=0.5; H.DepthMode=Enum.HighlightDepthMode.AlwaysOnTop
        H.Enabled=ESPEnabled; H.Parent=Char
        Highlights[Player]=H
        -- Linha
        local Li = Drawing.new("Line")
        Li.Visible=false; Li.Thickness=2; Li.Transparency=1; Li.Color=LineColor
        LineDraws[Player]=Li
        -- Caixa (4 linhas)
        local box={}
        for i=1,4 do
            local l=Drawing.new("Line"); l.Visible=false; l.Thickness=2; l.Transparency=1; l.Color=BoxColor
            box[i]=l
        end
        BoxDraws[Player]=box
        -- Esqueleto
        local bones=GetBones(Char); local skel={}
        for i=1,#bones do
            local l=Drawing.new("Line"); l.Visible=false; l.Thickness=2; l.Transparency=1; l.Color=SkeletonColor
            skel[i]={line=l, b1=bones[i][1], b2=bones[i][2]}
        end
        SkelDraws[Player]=skel
        -- Distância
        local dt=Drawing.new("Text"); dt.Visible=false; dt.Size=13; dt.Center=true
        dt.Outline=true; dt.Color=Color3.new(1,1,1); dt.Font=2
        DistLabels[Player]=dt
        -- Nome
        local nt=Drawing.new("Text"); nt.Visible=false; nt.Size=13; nt.Center=true
        nt.Outline=true; nt.Color=Color3.new(1,1,1); nt.Font=2
        NameLabels[Player]=nt
        -- Barra vida fundo
        local hb=Drawing.new("Line"); hb.Visible=false; hb.Thickness=6; hb.Transparency=1; hb.Color=Color3.new(0,0,0)
        HealthBarsB[Player]=hb
        -- Barra vida frente
        local hf=Drawing.new("Line"); hf.Visible=false; hf.Thickness=4; hf.Transparency=1; hf.Color=Color3.new(0,1,0)
        HealthBars[Player]=hf
    end
    if Player.Character then Load(Player.Character) end
    Player.CharacterAdded:Connect(function(Char) task.wait(1); Load(Char) end)
end

for _,P in pairs(Players:GetPlayers()) do CriarESP(P) end
Players.PlayerAdded:Connect(CriarESP)
Players.PlayerRemoving:Connect(LimparESP)

--// CÍRCULO DE AIMFOV
local FovCircle = Drawing.new("Circle")
FovCircle.Thickness    = 2
FovCircle.Radius       = AimFOV
FovCircle.Filled       = false
FovCircle.Visible      = false
FovCircle.Color        = Color3.new(1, 1, 1)
FovCircle.Transparency = 1

--// RAYFIELD UI
local Rayfield = loadstring(game:HttpGet("https://sirius.menu/rayfield"))()
local Window = Rayfield:CreateWindow({
    Name="B13 CORINGA FFH4X", LoadingTitle="B13 CORINGA FFH4X",
    LoadingSubtitle="by B13 CORINGA | discord.gg/tDsNEjWT4j",
    ConfigurationSaving={Enabled=false}, KeySystem=false
})

--// ABA PRINCIPAL
local Main = Window:CreateTab("Principal", 4483362458)
Main:CreateSection("Movimento")
Main:CreateSlider({Name="WalkSpeed",Range={16,600},Increment=1,CurrentValue=16,
    Callback=function(v) SpeedValue=v; local h=GetHum(); if h then h.WalkSpeed=v end end})
Main:CreateSlider({Name="JumpPower",Range={50,600},Increment=1,CurrentValue=50,
    Callback=function(v) JumpValue=v; local h=GetHum(); if h then h.UseJumpPower=true; h.JumpPower=v end end})
Main:CreateToggle({Name="Auto Pulo",CurrentValue=false,Callback=function(v) AutoJump=v end})
Main:CreateToggle({Name="Pulo Infinito",CurrentValue=false,Callback=function(v) InfJump=v end})
Main:CreateSection("Visual")
Main:CreateButton({Name="FullBright",Callback=function()
    Lighting.Brightness=5; Lighting.ClockTime=12; Lighting.FogEnd=999999; Lighting.GlobalShadows=false
end})
Main:CreateToggle({Name="Spin Bot",CurrentValue=false,Callback=function(v) Spinbot=v end})
Main:CreateSlider({Name="Velocidade Spin",Range={1,100},Increment=1,CurrentValue=25,
    Callback=function(v) SpinSpeed=v end})
Main:CreateSection("Hacks")
Main:CreateToggle({Name="Voar",CurrentValue=false,Callback=function(v)
    Fly=v
    if not v then if BV then BV:Destroy(); BV=nil end; if BG then BG:Destroy(); BG=nil end end
end})
Main:CreateSlider({Name="Velocidade de Voo",Range={20,500},Increment=5,CurrentValue=80,
    Callback=function(v) FlySpeed=v end})
Main:CreateToggle({Name="NoClip (Atravessar Paredes)",CurrentValue=false,
    Callback=function(v) NoClip=v end})
Main:CreateToggle({Name="God Mode (Vida Infinita)",CurrentValue=false,
    Callback=function(v) GodMode=v end})

--// ABA AIMBOT
local AimTab = Window:CreateTab("Aimbot", 4483362458)
AimTab:CreateSection("Mira Automática")
AimTab:CreateToggle({Name="Aimbot",CurrentValue=false,Callback=function(v) Aimbot=v end})
AimTab:CreateSlider({Name="FOV da Mira",Range={20,600},Increment=5,CurrentValue=120,
    Callback=function(v) AimFOV=v; FovCircle.Radius=v end})
AimTab:CreateSlider({Name="Suavidade",Range={1,100},Increment=1,CurrentValue=15,
    Callback=function(v) AimSmoothness=v/100 end})
AimTab:CreateDropdown({Name="Parte do Corpo",Options={"Head","HumanoidRootPart","UpperTorso","Torso"},
    CurrentOption="Head",Callback=function(v) AimPart=v end})
AimTab:CreateToggle({Name="Sem Recuo",CurrentValue=false,Callback=function(v) NoRecoil=v end})
AimTab:CreateSection("Círculo FOV")
AimTab:CreateToggle({Name="Mostrar Círculo FOV",CurrentValue=false,
    Callback=function(v) ShowFOV=v; FovCircle.Visible=v end})
AimTab:CreateToggle({Name="Círculo FOV RGB",CurrentValue=false,
    Callback=function(v) RGBFov=v end})

--// ABA ESP
local ESPTab = Window:CreateTab("ESP", 4483362458)
ESPTab:CreateSection("Highlight")
ESPTab:CreateToggle({Name="Highlight ESP",CurrentValue=false,Callback=function(v)
    ESPEnabled=v; for _,h in pairs(Highlights) do h.Enabled=v end
end})
ESPTab:CreateColorPicker({Name="Cor Highlight",Color=ESPColor,Callback=function(v)
    ESPColor=v; for _,h in pairs(Highlights) do h.FillColor=v end
end})
ESPTab:CreateSection("Caixa")
ESPTab:CreateToggle({Name="ESP Caixa",CurrentValue=false,Callback=function(v)
    BoxESP=v
    if not v then for _,box in pairs(BoxDraws) do for _,l in pairs(box) do l.Visible=false end end end
end})
ESPTab:CreateToggle({Name="ESP Caixa RGB",CurrentValue=false,Callback=function(v) RGBBox=v end})
ESPTab:CreateColorPicker({Name="Cor da Caixa",Color=BoxColor,Callback=function(v)
    BoxColor=v; for _,box in pairs(BoxDraws) do for _,l in pairs(box) do l.Color=v end end
end})
ESPTab:CreateSection("Esqueleto")
ESPTab:CreateToggle({Name="ESP Esqueleto",CurrentValue=false,Callback=function(v)
    SkeletonESP=v
    if not v then for _,sk in pairs(SkelDraws) do for _,s in pairs(sk) do s.line.Visible=false end end end
end})
ESPTab:CreateToggle({Name="ESP Esqueleto RGB",CurrentValue=false,Callback=function(v) RGBSkeleton=v end})
ESPTab:CreateColorPicker({Name="Cor do Esqueleto",Color=SkeletonColor,Callback=function(v)
    SkeletonColor=v; for _,sk in pairs(SkelDraws) do for _,s in pairs(sk) do s.line.Color=v end end
end})
ESPTab:CreateSection("Linha")
ESPTab:CreateToggle({Name="ESP Linha",CurrentValue=false,Callback=function(v)
    LineESP=v; if not v then for _,l in pairs(LineDraws) do l.Visible=false end end
end})
ESPTab:CreateToggle({Name="ESP Linha RGB",CurrentValue=false,Callback=function(v) RGBLine=v end})
ESPTab:CreateColorPicker({Name="Cor da Linha",Color=LineColor,Callback=function(v)
    LineColor=v; for _,l in pairs(LineDraws) do l.Color=v end
end})
ESPTab:CreateSection("Informações")
ESPTab:CreateToggle({Name="ESP Distância",CurrentValue=false,Callback=function(v)
    DistESP=v; if not v then for _,d in pairs(DistLabels) do d.Visible=false end end
end})
ESPTab:CreateToggle({Name="ESP Nome",CurrentValue=false,Callback=function(v)
    NameESP=v; if not v then for _,n in pairs(NameLabels) do n.Visible=false end end
end})
ESPTab:CreateToggle({Name="ESP Barra de Vida",CurrentValue=false,Callback=function(v)
    HealthESP=v
    if not v then
        for _,h in pairs(HealthBars)  do h.Visible=false end
        for _,h in pairs(HealthBarsB) do h.Visible=false end
    end
end})

--// ABA MISC
local Misc = Window:CreateTab("Misc", 4483362458)
Misc:CreateSection("Proteção Ativa")
Misc:CreateToggle({Name="Anti Kick (ATIVO)",CurrentValue=true,Callback=function() end})
Misc:CreateToggle({Name="Anti AFK (ATIVO)",CurrentValue=true,Callback=function() end})

--// LOOP PRINCIPAL
local rgbT = 0
RunService.Heartbeat:Connect(function(dt)
    rgbT = (rgbT + dt * 0.25) % 1
    local rgb = Color3.fromHSV(rgbT, 1, 1)

    local Char = LP.Character
    if not Char then return end
    local Hum = Char:FindFirstChildOfClass("Humanoid")
    local HRP = Char:FindFirstChild("HumanoidRootPart")

    -- SPEED / JUMP / GOD
    if Hum and HRP then
        if Hum.WalkSpeed ~= SpeedValue then Hum.WalkSpeed = SpeedValue end
        Hum.UseJumpPower = true
        if Hum.JumpPower ~= JumpValue then Hum.JumpPower = JumpValue end
        if AutoJump and Hum.FloorMaterial ~= Enum.Material.Air then
            Hum:ChangeState(Enum.HumanoidStateType.Jumping)
        end
        if GodMode then Hum.Health = Hum.MaxHealth end
    end

    -- NOCLIP
    if NoClip and Char then
        for _,p in pairs(Char:GetDescendants()) do
            if p:IsA("BasePart") then p.CanCollide = false end
        end
    end

    -- SPINBOT
    if Spinbot and HRP then
        HRP.CFrame = HRP.CFrame * CFrame.Angles(0, math.rad(SpinSpeed), 0)
    end

    -- CÍRCULO FOV
    if ShowFOV then
        FovCircle.Visible   = true
        FovCircle.Radius    = AimFOV
        FovCircle.Position  = Vector2.new(Camera.ViewportSize.X/2, Camera.ViewportSize.Y/2)
        FovCircle.Color     = RGBFov and rgb or Color3.new(1,1,1)
    else
        FovCircle.Visible   = false
    end

    -- LOOP ESP
    for Player, Line in pairs(LineDraws) do
        local Char2 = Player.Character
        local Hum2  = Char2 and Char2:FindFirstChildOfClass("Humanoid")
        local alive = Char2 and Char2:FindFirstChild("HumanoidRootPart") and Hum2 and Hum2.Health > 0

        local box  = BoxDraws[Player]
        local skel = SkelDraws[Player]
        local dLbl = DistLabels[Player]
        local nLbl = NameLabels[Player]
        local hBar = HealthBars[Player]
        local hBrB = HealthBarsB[Player]

        if not alive then
            Line.Visible = false
            if box  then for _,l in pairs(box)  do l.Visible=false end end
            if skel then for _,s in pairs(skel) do s.line.Visible=false end end
            if dLbl then dLbl.Visible=false end
            if nLbl then nLbl.Visible=false end
            if hBar then hBar.Visible=false end
            if hBrB then hBrB.Visible=false end
            continue
        end

        local HRP2   = Char2.HumanoidRootPart
        local RootPos= HRP2.Position

        -- Calcular top/bottom do personagem na tela
        local HeadPart = Char2:FindFirstChild("Head")
        local headTopWS = HeadPart
            and (HeadPart.Position + Vector3.new(0, HeadPart.Size.Y * 0.5 + 0.1, 0))
            or  (RootPos + Vector3.new(0,3,0))
        local feetBotWS = RootPos - Vector3.new(0, 3, 0)

        local scrHead = Camera:WorldToViewportPoint(headTopWS)
        local scrFeet = Camera:WorldToViewportPoint(feetBotWS)
        local scrRoot, visRoot = Camera:WorldToViewportPoint(RootPos)

        -- Caixa bounding
        local bH     = math.max(math.abs(scrHead.Y - scrFeet.Y), 10)
        local bW     = bH * 0.5
        local bCX    = (scrHead.X + scrFeet.X) / 2
        local bTop   = math.min(scrHead.Y, scrFeet.Y)
        local bBot   = math.max(scrHead.Y, scrFeet.Y)
        local bLeft  = bCX - bW/2
        local bRight = bCX + bW/2
        local inView = scrHead.Z > 0 and scrFeet.Z > 0

        -- LINHA
        if LineESP and visRoot and scrRoot.Z > 0 then
            Line.Visible = true
            Line.From    = Vector2.new(Camera.ViewportSize.X/2, Camera.ViewportSize.Y)
            Line.To      = Vector2.new(scrRoot.X, scrRoot.Y)
            Line.Color   = RGBLine and rgb or LineColor
        else
            Line.Visible = false
        end

        -- CAIXA
        if box then
            if BoxESP and inView then
                local bc = RGBBox and rgb or BoxColor
                box[1].From=Vector2.new(bLeft,bTop);  box[1].To=Vector2.new(bRight,bTop)
                box[2].From=Vector2.new(bLeft,bBot);  box[2].To=Vector2.new(bRight,bBot)
                box[3].From=Vector2.new(bLeft,bTop);  box[3].To=Vector2.new(bLeft,bBot)
                box[4].From=Vector2.new(bRight,bTop); box[4].To=Vector2.new(bRight,bBot)
                for _,l in pairs(box) do l.Visible=true; l.Color=bc end
            else
                for _,l in pairs(box) do l.Visible=false end
            end
        end

        -- ESQUELETO
        if skel then
            if SkeletonESP then
                local sc = RGBSkeleton and rgb or SkeletonColor
                for _,s in pairs(skel) do
                    local p1 = Char2:FindFirstChild(s.b1)
                    local p2 = Char2:FindFirstChild(s.b2)
                    if p1 and p2 then
                        local sp1 = Camera:WorldToViewportPoint(p1.Position)
                        local sp2 = Camera:WorldToViewportPoint(p2.Position)
                        if sp1.Z > 0 and sp2.Z > 0 then
                            s.line.From    = Vector2.new(sp1.X, sp1.Y)
                            s.line.To      = Vector2.new(sp2.X, sp2.Y)
                            s.line.Color   = sc
                            s.line.Visible = true
                        else
                            s.line.Visible = false
                        end
                    else
                        s.line.Visible = false
                    end
                end
            else
                for _,s in pairs(skel) do s.line.Visible=false end
            end
        end

        -- DISTÂNCIA
        if dLbl then
            if DistESP and inView then
                local myR = GetRoot()
                if myR then
                    dLbl.Text=(math.floor((myR.Position-RootPos).Magnitude)).."m"
                    dLbl.Position=Vector2.new(bCX, bBot+3); dLbl.Visible=true
                else dLbl.Visible=false end
            else dLbl.Visible=false end
        end

        -- NOME
        if nLbl then
            if NameESP and inView then
                nLbl.Text=Player.Name; nLbl.Position=Vector2.new(bCX, bTop-16); nLbl.Visible=true
            else nLbl.Visible=false end
        end

        -- BARRA VIDA
        if hBar and hBrB then
            if HealthESP and inView and Hum2 then
                local hp = Hum2.Health/Hum2.MaxHealth
                local bX = bLeft - 5
                hBrB.From=Vector2.new(bX,bTop); hBrB.To=Vector2.new(bX,bBot); hBrB.Visible=true
                hBar.From=Vector2.new(bX, bBot - (bH*hp)); hBar.To=Vector2.new(bX,bBot)
                hBar.Color=Color3.fromHSV(hp*0.33,1,1); hBar.Visible=true
            else hBar.Visible=false; hBrB.Visible=false end
        end
    end

    -- AIMBOT
    if Aimbot then
        local Closest, BestDist = nil, AimFOV
        for _,P in pairs(Players:GetPlayers()) do
            if P ~= LP and P.Character then
                local Part = P.Character:FindFirstChild(AimPart) or P.Character:FindFirstChild("Head")
                if Part then
                    local sp, vis = Camera:WorldToViewportPoint(Part.Position)
                    if vis and sp.Z>0 then
                        local mag=(Vector2.new(sp.X,sp.Y)-Vector2.new(Camera.ViewportSize.X/2,Camera.ViewportSize.Y/2)).Magnitude
                        if mag < BestDist then BestDist=mag; Closest=Part end
                    end
                end
            end
        end
        if Closest then
            Camera.CFrame = Camera.CFrame:Lerp(CFrame.lookAt(Camera.CFrame.Position, Closest.Position), AimSmoothness)
        end
    end

    -- SEM RECUO
    if NoRecoil then
        Camera.CFrame=CFrame.new(Camera.CFrame.Position, Camera.CFrame.Position+Camera.CFrame.LookVector)
    end

    -- VOAR
    if Fly and HRP then
        if not BV then
            BV=Instance.new("BodyVelocity"); BV.MaxForce=Vector3.new(1e9,1e9,1e9)
            BV.Velocity=Vector3.zero; BV.Parent=HRP
        end
        if not BG then
            BG=Instance.new("BodyGyro"); BG.MaxTorque=Vector3.new(1e9,1e9,1e9)
            BG.P=9e4; BG.Parent=HRP
        end
        BG.CFrame=Camera.CFrame
        local Dir=Vector3.zero
        if UserInputService:IsKeyDown(Enum.KeyCode.W) then Dir+=Camera.CFrame.LookVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.S) then Dir-=Camera.CFrame.LookVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.A) then Dir-=Camera.CFrame.RightVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.D) then Dir+=Camera.CFrame.RightVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.Space) then Dir+=Vector3.new(0,1,0) end
        if UserInputService:IsKeyDown(Enum.KeyCode.LeftControl) then Dir-=Vector3.new(0,1,0) end
        BV.Velocity=Dir*FlySpeed
    end
end)

--// PULO INFINITO
UserInputService.JumpRequest:Connect(function()
    if InfJump then local h=GetHum(); if h then h:ChangeState(Enum.HumanoidStateType.Jumping) end end
end)

--// FIX RESPAWN
LP.CharacterAdded:Connect(function()
    task.wait(1)
    local h=GetHum()
    if h then h.WalkSpeed=SpeedValue; h.UseJumpPower=true; h.JumpPower=JumpValue end
    for P,H in pairs(Highlights) do
        if P.Character then H.Parent=P.Character end
    end
end)

Rayfield:Notify({Title="B13 CORINGA FFH4X",Content="Carregado com sucesso! discord.gg/tDsNEjWT4j",Duration=6})
