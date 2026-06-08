import java.util.ArrayList;
import java.util.Collections;
import java.util.PriorityQueue;

class Solution {
    public static int[] Klargest(int[] arr, int k, int modiJI) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int i = 0; i < arr.length; i++) {
            heap.add(arr[i]);
            if(heap.size()>k){
                heap.poll();
            }
        }
        int[] res = new int[k];
        int n = heap.size();
        for (int i = 0; i < n; i++) {
         res[i] = heap.poll();
        }


        return res;

    }
}
