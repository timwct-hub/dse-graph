import React from 'react';
import { GraphType } from '../types';

interface Props {
  type: GraphType;
}

export default function Notes({ type }: Props) {
  const notes = {
    general: (
      <>
        <h3 className="font-bold text-sm text-gray-800 mb-2">General Rules 萬能規律</h3>
        <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
          <li><strong>y = f(x) + k:</strong> Up/Down Shift 垂直平移</li>
          <li><strong>y = f(x - h):</strong> Right/Left Shift 水平平移</li>
          <li><strong>y = -f(x):</strong> Reflect in x-axis 沿x軸反射</li>
          <li><strong>y = f(-x):</strong> Reflect in y-axis 沿y軸反射</li>
          <li><strong>y = a·f(x):</strong> Vertical Stretch 垂直拉伸 (a&gt;1 steeper, 0&lt;a&lt;1 flatter)</li>
          <li><strong>y = f(bx):</strong> Horizontal Compression 水平壓縮</li>
        </ul>
      </>
    ),
    quadratic: (
      <>
        <h3 className="font-bold text-sm text-gray-800 mb-2">Quadratic 二次函數</h3>
        <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
          <li><strong>Vertex 頂點:</strong> (h, k)</li>
          <li><strong>Axis of Symmetry 對稱軸:</strong> x = h</li>
          <li><strong>a &gt; 0:</strong> Opens upward 向上 ∪</li>
          <li><strong>a &lt; 0:</strong> Opens downward 向下 ∩</li>
          <li><strong>|a| size:</strong> Larger = narrower 較窄, Smaller = wider 較闊</li>
        </ul>
      </>
    ),
    exponential: (
      <>
        <h3 className="font-bold text-sm text-gray-800 mb-2">Exponential 指數函數</h3>
        <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
          <li><strong>Fixed Point 恆過定點:</strong> (0, 1) when h=0, k=0</li>
          <li><strong>Asymptote 漸近線:</strong> y = k</li>
          <li><strong>a &gt; 1:</strong> Growth 增長 (rises left to right)</li>
          <li><strong>0 &lt; a &lt; 1:</strong> Decay 衰減 (falls left to right)</li>
        </ul>
      </>
    ),
    logarithmic: (
      <>
        <h3 className="font-bold text-sm text-gray-800 mb-2">Logarithmic 對數函數</h3>
        <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
          <li><strong>Fixed Point 恆過定點:</strong> (1, 0) when h=0, k=0</li>
          <li><strong>Asymptote 漸近線:</strong> x = h</li>
          <li><strong>Domain 定義域:</strong> x &gt; h</li>
          <li><strong>Inverse 逆函數:</strong> Reflection of y = a<sup>x</sup> along y = x</li>
        </ul>
      </>
    ),
    trigonometric: (
      <>
        <h3 className="font-bold text-sm text-gray-800 mb-2">Trigonometric 三角函數</h3>
        <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
          <li><strong>Amplitude 振幅:</strong> |a| (Height of wave)</li>
          <li><strong>Period 週期:</strong> 360°/b or 2π/b</li>
          <li><strong>Phase Shift 相位移動:</strong> Controlled by h</li>
          <li><strong>Vertical Shift 垂直平移:</strong> Controlled by k</li>
        </ul>
      </>
    )
  };

  return (
    <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
      {notes[type]}
    </div>
  );
}
