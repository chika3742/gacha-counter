export interface GachaType {
  id: string
  title: string
  star5Pity: number
  star5PseudoPityBorder: number
  offBannerItems: string[]
  singleProb: number
  consecutiveOffBannerGuarantee?: ConsecutiveOffBannerGuarantee
}

export interface ConsecutiveOffBannerGuarantee {
  threshold: number
  startDate: string
  markerLabelKey: string
}
