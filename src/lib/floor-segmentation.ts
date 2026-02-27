import '@tensorflow/tfjs'
import * as deeplab from '@tensorflow-models/deeplab'

// ADE20K Color Map - Index 3 is usually "floor, flooring"
// We will mask specifically for the floor class.
const FLOOR_CLASS_ID = 3

export async function generateFloorMask(imageElement: HTMLImageElement): Promise<string> {
    try {
        console.log('Loading DeepLab model...')
        const model = await deeplab.load({ base: 'ade20k', quantizationBytes: 2 })

        console.log('Segmenting image...')
        const output = await model.segment(imageElement)

        // Output.segmentationMap is a flattened Int32Array of class IDs
        const { width, height, segmentationMap } = output

        // Create a canvas to draw the mask
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')

        const imageData = ctx.createImageData(width, height)
        const data = imageData.data

        // Loop through the segmentation map
        for (let i = 0; i < segmentationMap.length; i++) {
            const classId = segmentationMap[i]

            // If it's floor, make it visible white/black, otherwise transparent
            // We want the mask to be the distinct shape for CSS 'mask-image'
            // In CSS mask-image: opaque areas are visible, transparent are hidden.
            // So we want the FLOOR to be OPAQUE (visible), and everything else TRANSPARENT.

            if (classId === FLOOR_CLASS_ID) {
                // Opaque Black (or any color, alpha matters)
                data[i * 4 + 0] = 0   // R
                data[i * 4 + 1] = 0   // G
                data[i * 4 + 2] = 0   // B
                data[i * 4 + 3] = 255 // Alpha = Visible
            } else {
                // Transparent
                data[i * 4 + 0] = 0
                data[i * 4 + 1] = 0
                data[i * 4 + 2] = 0
                data[i * 4 + 3] = 0   // Alpha = Invisible
            }
        }

        ctx.putImageData(imageData, 0, 0)

        // Return Data URL
        return canvas.toDataURL()

    } catch (error) {
        console.error('Segmentation failed:', error)
        throw error
    }
}
