$Global:AppiumBase = "http://127.0.0.1:4723"
$Global:SessionId = Get-Content "J:\JOB__2_QA\AKBata\Mobil\AKBata\session_id.txt"

function Invoke-AppiumJson($method, $path, $obj) {
  $json = $obj | ConvertTo-Json -Depth 10
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  return Invoke-RestMethod -Uri "$Global:AppiumBase/session/$Global:SessionId$path" -Method $method -Body $bytes -ContentType "application/json; charset=utf-8" -TimeoutSec 20
}

function Find-Els($using, $value) {
  try {
    $r = Invoke-AppiumJson "Post" "/elements" @{ using = $using; value = $value }
    return ,@($r.value)
  } catch { return ,@() }
}

function Click-ElementId($elId) {
  Invoke-AppiumJson "Post" "/element/$elId/click" @{} | Out-Null
}

function Click-ByAccessibilityId($label) {
  $els = Find-Els "accessibility id" $label
  if ($els.Count -gt 0) {
    Click-ElementId $els[0].ELEMENT
    return $true
  }
  return $false
}

function Click-ByXPath($xpath) {
  $els = Find-Els "xpath" $xpath
  if ($els.Count -gt 0) {
    Click-ElementId $els[0].ELEMENT
    return $true
  }
  return $false
}

function SendKeys-ByAccessibilityId($label, $text) {
  $els = Find-Els "accessibility id" $label
  if ($els.Count -gt 0) {
    $elId = $els[0].ELEMENT
    Invoke-AppiumJson "Post" "/element/$elId/value" @{ text = $text } | Out-Null
    return $true
  }
  return $false
}

function SendKeys-ByXPath($xpath, $text) {
  $els = Find-Els "xpath" $xpath
  if ($els.Count -gt 0) {
    $elId = $els[0].ELEMENT
    Invoke-AppiumJson "Post" "/element/$elId/value" @{ text = $text } | Out-Null
    return $true
  }
  return $false
}

function Press-Back() {
  Invoke-AppiumJson "Post" "/appium/device/press_keycode" @{ keycode = 4 } | Out-Null
}

function Tap-XY($x, $y) {
  $obj = @{
    actions = @(
      @{
        type = "pointer"
        id = "finger1"
        parameters = @{ pointerType = "touch" }
        actions = @(
          @{ type = "pointerMove"; duration = 0; x = $x; y = $y },
          @{ type = "pointerDown"; button = 0 },
          @{ type = "pointerUp"; button = 0 }
        )
      }
    )
  }
  Invoke-AppiumJson "Post" "/actions" $obj | Out-Null
}

function Get-Src($label) {
  $r = Invoke-RestMethod -Uri "$Global:AppiumBase/session/$Global:SessionId/source" -Method Get -TimeoutSec 30
  $path = "J:\JOB__2_QA\AKBata\Mobil\AKBata\dumps\$label.xml"
  New-Item -ItemType Directory -Force -Path "J:\JOB__2_QA\AKBata\Mobil\AKBata\dumps" | Out-Null
  Set-Content -Path $path -Value $r.value -Encoding UTF8
  Write-Output "saved: $path ($($r.value.Length) chars)"
}
