import { parseClap } from "@/io/parseClap"
import { serializeClap } from "@/io/serializeClap"
import { ClapProject, ClapSegmentCategory, ClapSegmentStatus } from "@/types"

/**
 * Keep or remove segment assets, by category
 * 
 * You can choose a mode, to either INCLUDE or EXCLUDE
 * 
 * The original is NOT modifed by default, unless you set: `modifyOriginal: true`
 * which will clone the whole clap project
 */
export async function filterClapSegmentAssets({
  clap,
  immutable,
  mode,
  categories,
  updateStatus = true
}: {
  clap: ClapProject
  immutable?: boolean
  mode: "INCLUDE" | "EXCLUDE"
  categories: Record<ClapSegmentCategory, boolean>
  updateStatus?: boolean
}): Promise<ClapProject> {

  if (immutable) {
    const tmp = await serializeClap(clap)
    const newClap = await parseClap(tmp)
    return filterClapSegmentAssets({
      clap: newClap,
      immutable: false,
      mode,
      categories,
      updateStatus,
    })
  }

  if (mode !== "INCLUDE" && mode !== "EXCLUDE") {
    throw new Error(`unsupported mode "${mode}"`)
  }

  clap.segments = clap.segments.map(segment => {
    if (mode === "INCLUDE") {
      if (typeof categories[segment.category] === "boolean" && categories[segment.category]) {
        segment.assetUrl = segment.assetUrl
      } else {
        segment.assetUrl = ""
        if (updateStatus) {
          segment.status = ClapSegmentStatus.TO_GENERATE
        }
      }
    } else if (mode === "EXCLUDE") {
      if (typeof categories[segment.category] === "boolean" && !categories[segment.category]) {
        segment.assetUrl = ""
        if (updateStatus) {
          segment.status = ClapSegmentStatus.TO_GENERATE
        }
      } else {
        segment.assetUrl = segment.assetUrl
      }
    }
    return segment
  })
  
  return clap
}